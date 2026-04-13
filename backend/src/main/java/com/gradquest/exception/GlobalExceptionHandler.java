package com.gradquest.exception;

import com.gradquest.web.ApiResponses;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public Object handleApiException(ApiException exception) {
        return ApiResponses.error(exception.getStatus(), exception.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Object handleValidationException(MethodArgumentNotValidException exception) {
        FieldError fieldError = exception.getBindingResult().getFieldErrors().stream().findFirst().orElse(null);
        String message = fieldError != null ? fieldError.getDefaultMessage() : "Request validation failed.";
        return ApiResponses.error(HttpStatus.BAD_REQUEST, message);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public Object handleConstraintViolation(ConstraintViolationException exception) {
        return ApiResponses.error(HttpStatus.BAD_REQUEST, exception.getMessage());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public Object handleUnreadableMessage(HttpMessageNotReadableException exception) {
        return ApiResponses.error(HttpStatus.BAD_REQUEST, "Request body could not be parsed.");
    }

    @ExceptionHandler(AccessDeniedException.class)
    public Object handleAccessDenied(AccessDeniedException exception) {
        return ApiResponses.error(HttpStatus.FORBIDDEN, "You do not have permission to access this resource.");
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public Object handleNoResourceFound(NoResourceFoundException exception) {
        return ApiResponses.error(HttpStatus.NOT_FOUND, "Resource not found.");
    }

    @ExceptionHandler(Exception.class)
    public Object handleUnexpectedException(Exception exception) {
        return ApiResponses.error(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected server error occurred.");
    }
}
