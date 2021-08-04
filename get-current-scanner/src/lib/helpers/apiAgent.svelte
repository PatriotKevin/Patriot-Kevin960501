<script context="module">
    import { goto } from "$app/navigation";
    import _union from "$lib/lodash/union";
    import _clone from "$lib/lodash/clone";
    import _pick from "$lib/lodash/pick";

    import { config } from "$lib/helpers/config.svelte";
    /**
     *
     * */
    function queryComponents(context, data) {
        let components = [];
        if (typeof data == "object") {
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    const element = data[key];
                    let childContext = _clone(context);
                    childContext.push(key);
                    components = _union(
                        components,
                        queryComponents(childContext, element)
                    );
                }
            }
        } else {
            let queryKey = context[0];
            for (let i = 1; i < context.length; i++) {
                queryKey += `[${context[i]}]`;
            }
            let queryValue = data;
            components = [
                `${encodeURIComponent(queryKey)}=${encodeURIComponent(
                    queryValue
                )}`,
            ];
        }
        return components;
    }
    function encodeQueryData(data, context) {
        let ret = [];
        for (const key in data) {
            ret = _union(ret, queryComponents([key], data[key]));
        }
        return ret.join("&");
    }
    const autoRedirectResponseCodes = [401]; //401 - Unauthorized

    /**
     * @description
     * An APIAgent instance keep token and serverURL, and thus calling the instance with only relevant parameters would handle the rest.
     * apiAgent instance is shared by default. The constructor can be customized with customized values.
     * @warning
     * When using APIAgent instance from server-side script (SSR==true), provide token parameter for each call (keeping it null or some string value).
     * Otherwise, APIAgent tries to read localStorage. (Intentionally didn't try-catch on this!)
     */
    export class APIAgent {
        constructor({ serverURL, token, autoRedirect, redirectURL }) {
            this.serverURL = serverURL;
            this.token = token;
            this.autoRedirect = autoRedirect;
            this.redirectURL = redirectURL;
        }
        getPersistedToken() {
            if (!localStorage) {
                return null;
            }
            if (localStorage.getItem("get-current-jwt-token")) {
                try {
                    return JSON.parse(
                        localStorage.getItem("get-current-jwt-token")
                    );
                }
                catch {
                    return null;
                }
            } else return null;
        }
        setPersistToken(token) {
            if (!localStorage) return;
            localStorage.setItem(
                "get-current-jwt-token",
                JSON.stringify(token)
            );
        }
        
        setUser(user) {
            if (!localStorage) return;
            localStorage.setItem("session-user", JSON.stringify(_pick(user, ['id', 'firstName', 'lastName'])))
        }
        getUser() {
            if (!localStorage) return {}
            return JSON.parse(localStorage.getItem("session-user"))
        }

        getToken() {
            // Return the token that will be used on API call.
            return this.token || this.getPersistedToken();
        }
        /**
         * @description Call GET API
         * @param token - If set, it overrides default token for the single request.
         * @returns response data from server
         * @throws
         * - When the server responded but with error code, the thrown error will look like
         *   {responded: true, id: __error_id_from_Strapi_server__, message: __friendly_error_message__}
         * - Other cases (For example connection timeout)
         *   {... message: __friendly_error_message__}
         */
        async get({ url, params, token, autoRedirect, redirectURL, headers }) {
            if (url.indexOf('http://')==0 || url.indexOf('https://')==0) {
            }
            else {
                if (url[0] != "/") url = "/" + url;
                url = this.serverURL + url
            }

            headers = headers || {
                "Content-Type": "application/json"
            };
            let _token;
            if (token !== undefined) {
                _token = token;
            } else {
                if (!this.token && this.getPersistedToken())
                    this.token = this.getPersistedToken(); //Automatically use the token persisted.
                _token = this.token;
            }
            if (_token)
                headers["Authorization"] = `Bearer ${token || this.token}`;

            let fetched = await fetch(
                url + "?" + encodeQueryData(params),
                {
                    method: "GET",
                    headers,
                }
            );
            let _autoRedirect =
                autoRedirect !== undefined ? autoRedirect : this.autoRedirect;
            let _redirectURL =
                redirectURL !== undefined ? redirectURL : this.redirectURL;
            if (
                _autoRedirect &&
                autoRedirectResponseCodes.indexOf(fetched.status) != -1
            ) {
                this.setPersistToken(null);
                goto(_redirectURL);
            }
            let data;
            try {
                data = await fetched.json();
            } catch {
                throw {
                    responded: true,
                    id: "json.parse.error",
                    message: "Error occurred while processing server response.",
                };
            }
            if (!fetched.ok) {
                if (data.message) {
                    if (typeof data.message == "string") {
                        throw data;
                    } else if (Array.isArray(data.message)) {
                        const errorData = data.message[0].messages[0];
                        throw {
                            gotResponse: true,
                            id: errorData.id,
                            message: errorData.message,
                        };
                    }
                }
                throw {
                    gotResponse: true,
                    id: "unknown.error",
                    message: "Unknown error occurred.",
                };
            }
            return data;
        }
          /**
         * @description Call POST API
         * @param token - If set, it overrides default token for the single request.
         * @returns response data from server
         * @throws
         * - When the server responded but with error code, the thrown error will look like
         *   {responded: true, id: __error_id_from_Strapi_server__, message: __friendly_error_message__}
         * - Other cases (For example connection timeout)
         *   {... message: __friendly_error_message__}
         */
        async post({ url, body, token, autoRedirect, redirectURL }) {
            if (url.indexOf('http://')==0 || url.indexOf('https://')==0) {
            }
            else {
                if (url[0] != "/") url = "/" + url;
                url = this.serverURL + url
            }

            let headers = {};
            let _token;
            if (token !== undefined) {
                _token = token;
            } else {
                if (!this.token && this.getPersistedToken())
                    this.token = this.getPersistedToken(); //Automatically use the token persisted.
                _token = this.token;
            }
            if (_token)
                headers["Authorization"] = `Bearer ${token || this.token}`;

            if (!(body instanceof FormData)) {
                headers["Content-Type"] = "application/json";
                body = JSON.stringify(body);
            }
            let fetched = await fetch(
                url, 
                {
                    method: "POST",
                    headers,
                    body,
                }
            );
            let _autoRedirect =
                autoRedirect !== undefined ? autoRedirect : this.autoRedirect;
            let _redirectURL =
                redirectURL !== undefined ? redirectURL : this.redirectURL;
            if (
                _autoRedirect &&
                autoRedirectResponseCodes.indexOf(fetched.status) != -1
            ) {
                this.setPersistToken(null);
                goto(_redirectURL);
            }
            let data;
            try {
                data = await fetched.json();
            } catch {
                throw {
                    responded: true,
                    id: "json.parse.error",
                    message: "Error occurred while processing server response.",
                };
            }
            if (!fetched.ok) {
                if (data.message) {
                    if (typeof data.message == "string") {
                        throw data;
                    } else if (Array.isArray(data.message)) {
                        const errorData = data.message[0].messages[0];
                        throw {
                            gotResponse: true,
                            id: errorData.id,
                            message: errorData.message,
                        };
                    }
                }
                throw {
                    gotResponse: true,
                    id: "unknown.error",
                    message: "Unknown error occurred.",
                };
            }
            return data;
        }
        /**
         * @description Call PUT API
         * @param token - If set, it overrides default token for the single request.
         * @returns response data from server
         * @throws
         * - When the server responded but with error code, the thrown error will look like
         *   {responded: true, id: __error_id_from_Strapi_server__, message: __friendly_error_message__}
         * - Other cases (For example connection timeout)
         *   {... message: __friendly_error_message__}
         */
        async put({ url, body, token, autoRedirect, redirectURL }) {
            if (url.indexOf('http://')==0 || url.indexOf('https://')==0) {
            }
            else {
                if (url[0] != "/") url = "/" + url;
                url = this.serverURL + url
            }

            let headers = {
                "Content-Type": "application/json",
            };
            let _token;
            if (token !== undefined) {
                _token = token;
            } else {
                if (!this.token && this.getPersistedToken())
                    this.token = this.getPersistedToken(); //Automatically use the token persisted.
                _token = this.token;
            }
            if (_token)
                headers["Authorization"] = `Bearer ${token || this.token}`;

            let fetched = await fetch(url, {
                method: "PUT",
                headers,
                body: JSON.stringify(body),
            });
            let _autoRedirect =
                autoRedirect !== undefined ? autoRedirect : this.autoRedirect;
            let _redirectURL =
                redirectURL !== undefined ? redirectURL : this.redirectURL;
            if (
                _autoRedirect &&
                autoRedirectResponseCodes.indexOf(fetched.status) != -1
            ) {
                this.setPersistToken(null);
                goto(_redirectURL);
            }
            let data;
            try {
                data = await fetched.json();
            } catch {
                throw {
                    responded: true,
                    id: "json.parse.error",
                    message: "Error occurred while processing server response.",
                };
            }
            if (!fetched.ok) {
                if (data.message) {
                    if (typeof data.message == "string") {
                        throw data;
                    } else if (Array.isArray(data.message)) {
                        const errorData = data.message[0].messages[0];
                        throw {
                            gotResponse: true,
                            id: errorData.id,
                            message: errorData.message,
                        };
                    }
                }
                throw {
                    gotResponse: true,
                    id: "unknown.error",
                    message: "Unknown error occurred.",
                };
            }
            return data;
        }
        /**
         * @description Call DELETE API
         * @param token - If set, it overrides default token for the single request.
         * @returns response data from server
         * @throws
         * - When the server responded but with error code, the thrown error will look like
         *   {responded: true, id: __error_id_from_Strapi_server__, message: __friendly_error_message__}
         * - Other cases (For example connection timeout)
         *   {... message: __friendly_error_message__}
         */
        async del({ url, token, autoRedirect, redirectURL }) {
            if (url.indexOf('http://')==0 || url.indexOf('https://')==0) {
            }
            else {
                if (url[0] != "/") url = "/" + url;
                url = this.serverURL + url
            }

            let headers = {
                "Content-Type": "application/json",
            };
            let _token;
            if (token !== undefined) {
                _token = token;
            } else {
                if (!this.token && this.getPersistedToken())
                    this.token = this.getPersistedToken(); //Automatically use the token persisted.
                _token = this.token;
            }
            if (_token)
                headers["Authorization"] = `Bearer ${token || this.token}`;

            let fetched = await fetch(url, {
                method: "DELETE",
                headers,
            });
            let _autoRedirect =
                autoRedirect !== undefined ? autoRedirect : this.autoRedirect;
            let _redirectURL =
                redirectURL !== undefined ? redirectURL : this.redirectURL;
            if (
                _autoRedirect &&
                autoRedirectResponseCodes.indexOf(fetched.status) != -1
            ) {
                this.setPersistToken(null);
                goto(_redirectURL);
            }
            let data;
            try {
                data = await fetched.json();
            } catch {
                throw {
                    responded: true,
                    id: "json.parse.error",
                    message: "Error occurred while processing server response.",
                };
            }
            if (!fetched.ok) {
                if (data.message) {
                    if (typeof data.message == "string") {
                        throw data;
                    } else if (Array.isArray(data.message)) {
                        const errorData = data.message[0].messages[0];
                        throw {
                            gotResponse: true,
                            id: errorData.id,
                            message: errorData.message,
                        };
                    }
                }
                throw {
                    gotResponse: true,
                    id: "unknown.error",
                    message: "Unknown error occurred.",
                };
            }
            return data;
        }
    }
    export let apiAgent = new APIAgent({
        serverURL: config.serverURL,
        token: null,
        autoRedirect: true,
        redirectURL: "/auth/login",
    });
</script>
