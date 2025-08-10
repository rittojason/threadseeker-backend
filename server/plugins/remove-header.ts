import { defineNitroPlugin } from 'nitropack/runtime';
import { type RenderResponse } from "nitropack/types";

export default defineNitroPlugin((nitroApp) => {
    nitroApp.hooks.hook('render:response', (response: RenderResponse) => {
        delete response.headers['x-zeabur-request-id'];
        delete response.headers['x-zeabur-ip-country'];
    })
})
