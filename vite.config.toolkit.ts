
const apiProxy = process.env.API_PROXY || 'http://172.17.0.1:8080'
const mqttProxy = process.env.MQTT_PROXY || 'http://mqtt:1884'


const useAliases = process.env.NODE_ENV === 'development' && process.env.BUILD_FROM_TS === "1"

const nodeModulesBasePath = useAliases ? '../sermas-toolkit-web/' : './'

const copyFiles = [

    // @vladmandic/human
    [`${nodeModulesBasePath}node_modules/@vladmandic/human/models/*.json`, "human/models"],
    [`${nodeModulesBasePath}node_modules/@vladmandic/human/models/*.bin`, "human/models"],
    [`${nodeModulesBasePath}node_modules/@tensorflow/tfjs-backend-wasm/wasm-out/*.wasm`, "tfjs-backend-wasm/wasm-out"],

    //ricky0123/vad-web
    [`${nodeModulesBasePath}node_modules/@ricky0123/vad-web/dist/silero_vad.onnx`, ''],
    [`${nodeModulesBasePath}node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js`, ''],
    //onnxruntime-web

    // [`${nodeModulesBasePath}node_modules/onnxruntime-web/dist/*.wasm`, ''],
    // [`${nodeModulesBasePath}node_modules/onnxruntime-web/dist/*.mjs`, ''],

    [`${nodeModulesBasePath}node_modules/onnxruntime-web/dist/*`, ''],
   
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
        return {
            src,
            dest,
        }
    })
}