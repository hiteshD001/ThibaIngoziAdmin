import { tailChase } from 'ldrs'
tailChase.register()

export const Loader = () => {
    return (
        <div className="loader">
            <l-tail-chase size={30} speed={2} color="black"></l-tail-chase>
        </div>
    )
}

export default Loader
