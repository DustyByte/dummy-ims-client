import { useState } from "react"
import './range.css'

export default function Range({ selected, handleSelected }){
    const [dropDown, setDropDown] = useState(false)
    const ranges = [`0-100`, `100-250`, `250-500`, `500-1000`, `1000+`, `All`]

    return (
        <div className="range">
            Price-range: 
            <div className="showField">
                <i>{selected}</i>
                <img style={{transform: dropDown?`rotate(-90deg)`:`rotate(90deg)`, transition: `0.3s ease-in-out transform`}} src={'/arrowDown.png'} alt="" onClick={() => setDropDown(prev => !prev)}/>
                {ranges.map((range, index) => <span key={index} style={{right: !dropDown ? 0 : `-${(index+1)*80}px`, opacity: !dropDown && `0`}} onClick={() => handleSelected(range)}>{range}</span>)}
            </div>
        </div>
    )
}