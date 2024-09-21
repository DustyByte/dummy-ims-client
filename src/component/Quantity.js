import { useState } from 'react'
import './quality.css'

export default function Quantity({ product, updateFunc }){
    const [amount, setAmount] = useState(product.amountPurchased)

    function handleMinus(){
        
        setAmount(prev => {
            const mult = prev>0 ? 1 : 0
            const update = (prev-1)*mult
            updateFunc(product.productName, update)
            return (update)
        })
    }

    function handlePlus(){
        setAmount(prev => {
            const update = prev+1
            updateFunc(product.productName, update)
            return (update)
        })
    }

    return (
        <div className='quantity'>
            <img onClick={() => handleMinus()} src='/minus.png' alt=''/>
            <div>
                <i>{amount}</i>
            </div>
            <img onClick={() => handlePlus()} src='/plus.png' alt=''/>
        </div>
    )
}