import { env } from "$env/dynamic/public"
import { SermasToolkit, type SermasToolkitOptions } from "@sermas/toolkit"

export let toolkit: SermasToolkit

export const createToolkit = (config: Partial<SermasToolkitOptions>) => {

    const url = config.url || env.PUBLIC_TOOLKIT_URL || "http://localhost:8080"

    const appId = config.appId || ''
    const moduleId = config.moduleId

    const auth = config.auth || {
        url: '',
        clientId: '',
        realm: '',
    }
    auth.url = auth.url || env.PUBLIC_AUTH_URL || "/keycloak"
    auth.realm = auth.realm || env.PUBLIC_AUTH_REALM || "sermas-local"

    if (!config.auth?.clientId) {
        auth.clientId = env.PUBLIC_AUTH_CLIENT_ID || "sermas"
        // if (appId) {
        //     auth.clientId = `${appId}-application`
        // }
    }

    if (!moduleId) throw new Error(`Missing moduleId`)

    const options: SermasToolkitOptions = {
        appId,
        moduleId,
        url,
        auth,
    }

    toolkit = new SermasToolkit(options)
    return toolkit
}