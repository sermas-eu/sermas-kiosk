
const apiProxy = process.env.API_PROXY || 'http://172.17.0.1:8080'
const mqttProxy = process.env.MQTT_PROXY || 'http://172.17.0.1:1884'


// assets the browser loads at runtime, served from the site root
const copyFiles = [
    // @ricky0123/vad-web: the audio worklet and the Silero models
    ['node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js', ''],
    ['node_modules/@ricky0123/vad-web/dist/silero_vad_v5.onnx', ''],
    // onnxruntime-web: the WASM runtime the VAD loads
    ['node_modules/onnxruntime-web/dist/*.wasm', ''],
    ['node_modules/onnxruntime-web/dist/*.mjs', ''],
]

// vite server options
// https://vitejs.dev/config/server-options.html
export const SermasViteConfig = {
    server: {
        proxy: {
            '/api': apiProxy,
            '/mqtt': {
                target: mqttProxy,
                ws: true,
            },
        },
        // listen on 0.0.0.0
        host: true,
        // exit if port used
        strictPort: true
    }
}

export const getCopyFiles = () => {
    return copyFiles.map((filepath) => {
        const [src, dest] = filepath
        // flat: vite-plugin-static-copy 4 keeps the source path otherwise
        return {
            src,
            dest: dest || '.',
            rename: { stripBase: true },
        }
    })
}