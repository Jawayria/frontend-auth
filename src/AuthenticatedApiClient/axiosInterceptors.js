
import { getConfig } from './index';
import { processAxiosError } from './utils';
import getCsrfToken from './getCsrfToken';
import getJwtToken from './getJwtToken';

const csrfTokenProviderInterceptor = (options) => {
  const { csrfTokenApiPath, shouldSkip } = options;

  // Creating the interceptor inside this closure to
  // maintain reference to the options supplied.
  const interceptor = async (axiosRequestConfig) => {
    if (shouldSkip(axiosRequestConfig)) {
      return axiosRequestConfig;
    }
    const { url } = axiosRequestConfig;
    const csrfToken = await getCsrfToken(url, csrfTokenApiPath);
    const CSRF_HEADER_NAME = 'X-CSRFToken';
    // eslint-disable-next-line no-param-reassign
    axiosRequestConfig.headers[CSRF_HEADER_NAME] = csrfToken;
    return axiosRequestConfig;
  };

  return interceptor;
};

const jwtTokenProviderInterceptor = (options) => {
  const {
    tokenCookieName,
    tokenRefreshEndpoint,
    handleUnexpectedRefreshError,
    shouldSkip,
  } = options;

  // Creating the interceptor inside this closure to
  // maintain reference to the options supplied.
  const interceptor = async (axiosRequestConfig) => {
    if (shouldSkip(axiosRequestConfig)) {
      return axiosRequestConfig;
    }
    try {
      await getJwtToken(tokenCookieName, tokenRefreshEndpoint);
    } catch (error) {
      handleUnexpectedRefreshError(error);
    }
    // Add the proper headers to tell the server to look for the jwt cookie
    // eslint-disable-next-line no-param-reassign
    axiosRequestConfig.headers.common['USE-JWT-COOKIE'] = true;
    return axiosRequestConfig;
  };

  return interceptor;
};

const processAxiosRequestErrorInterceptor = (error) => {
  const processedError = processAxiosError(error);
  const { httpErrorStatus } = processedError.customAttributes;
  if (httpErrorStatus === 401 || httpErrorStatus === 403) {
    getConfig().loggingService.logInfo(processedError, processedError.customAttributes);
  }
  return Promise.reject(processedError);
};

export {
  csrfTokenProviderInterceptor,
  jwtTokenProviderInterceptor,
  processAxiosRequestErrorInterceptor,
};
