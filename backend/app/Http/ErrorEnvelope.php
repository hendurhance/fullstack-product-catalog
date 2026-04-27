<?php

declare(strict_types=1);

namespace App\Http;

use App\Http\Middleware\AssignRequestId;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Exceptions\MissingAbilityException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Throwable;

/**
 * Builds the API error envelope: `{ message, errors?, code, request_id }`
 * (RFC 7807-inspired). One mapping table for all exception types so the
 * frontend never has to parse English to branch — it switches on `code`.
 */
final class ErrorEnvelope
{
    public static function from(Throwable $e, Request $request): JsonResponse
    {
        [$status, $code, $message, $errors] = self::map(self::unwrap($e));

        $body = [
            'message' => $message,
            'code' => $code,
            'request_id' => self::requestId($request),
        ];

        if ($errors !== null) {
            $body['errors'] = $errors;
        }

        if ($status >= 500 && config('app.debug')) {
            $body['debug'] = [
                'exception' => $e::class,
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ];
        }

        return new JsonResponse($body, $status);
    }

    /**
     * @return array{0:int,1:string,2:string,3:array<string,array<int,string>>|null}
     */
    private static function map(Throwable $e): array
    {
        return match (true) {
            $e instanceof ValidationException => [
                422,
                'VALIDATION_FAILED',
                'The given data was invalid.',
                $e->errors(),
            ],
            $e instanceof AuthenticationException => [
                401,
                'UNAUTHENTICATED',
                'Unauthenticated.',
                null,
            ],
            $e instanceof MissingAbilityException => [
                403,
                'FORBIDDEN_SCOPE',
                'Token does not include the required ability.',
                null,
            ],
            $e instanceof AuthorizationException => [
                403,
                'FORBIDDEN',
                $e->getMessage() !== '' ? $e->getMessage() : 'This action is unauthorized.',
                null,
            ],
            $e instanceof ModelNotFoundException => [
                404,
                self::notFoundCode($e),
                'Resource not found.',
                null,
            ],
            $e instanceof NotFoundHttpException => [
                404,
                'NOT_FOUND',
                'Not found.',
                null,
            ],
            $e instanceof TooManyRequestsHttpException => [
                429,
                'TOO_MANY_REQUESTS',
                'Too many requests.',
                null,
            ],
            $e instanceof HttpExceptionInterface => [
                $e->getStatusCode(),
                'HTTP_'.$e->getStatusCode(),
                $e->getMessage() !== '' ? $e->getMessage() : 'HTTP error.',
                null,
            ],
            default => [
                500,
                'INTERNAL_ERROR',
                config('app.debug') ? $e->getMessage() : 'Server error.',
                null,
            ],
        };
    }

    /*
     * Laravel's `prepareException()` repacks several typed exceptions into
     * generic HttpExceptions before our render callback runs. Unwrap the
     * common ones so the envelope can emit a precise code:
     *   ModelNotFoundException     -> NotFoundHttpException(previous)
     *   AuthorizationException     -> AccessDeniedHttpException(previous)
     */
    private static function unwrap(Throwable $e): Throwable
    {
        if ($e instanceof NotFoundHttpException) {
            $previous = $e->getPrevious();
            if ($previous instanceof ModelNotFoundException) {
                return $previous;
            }
        }

        if ($e instanceof AccessDeniedHttpException) {
            $previous = $e->getPrevious();
            if ($previous instanceof AuthorizationException) {
                return $previous;
            }
        }

        return $e;
    }

    private static function notFoundCode(ModelNotFoundException $e): string
    {
        $model = $e->getModel();
        if ($model === null || $model === '') {
            return 'NOT_FOUND';
        }

        return strtoupper(class_basename($model)).'_NOT_FOUND';
    }

    private static function requestId(Request $request): ?string
    {
        $id = $request->attributes->get(AssignRequestId::ATTRIBUTE);

        return is_string($id) ? $id : null;
    }
}
