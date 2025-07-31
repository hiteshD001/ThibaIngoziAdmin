import { tailChase } from 'ldrs'
tailChase.register()

export const Loader = ({ ...p }) => {
    return (
        <div className="loader">
            <l-tail-chase size={30} speed={2} color={p.color || "black"}></l-tail-chase>
        </div>
    )
}

export default Loader
