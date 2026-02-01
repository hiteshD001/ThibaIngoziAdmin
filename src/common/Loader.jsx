import { tailChase } from 'ldrs'
tailChase.register()

export const Loader = ({ size = 30, color = "black", ...p }) => {
    return (
        <div className="loader">
            <l-tail-chase size={size} speed={2} color={color}></l-tail-chase>
        </div>
    )
}

export default Loader
