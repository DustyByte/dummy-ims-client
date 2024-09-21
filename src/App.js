import React, { useEffect, useState } from 'react';
import './App.css';
import Range from './component/Range';
import Quantity from './component/Quantity';
import Spinner from './component/Spinner';


function round(floatVal){
  const str = floatVal.toString().split('.')

  if(str[1]){
    const valAfterPoint = str[1].slice(0, 2)
    return Number(str[0]+'.'+valAfterPoint)
  }
  return floatVal
}

function parseRange(range){
  if(range[range.length-1] == `+`) return {begin: 1000, end: 99999}
  const splitArr = range.split('-')
  const begin = Number(splitArr[0])
  const end = Number(splitArr[1])

  return {begin, end}
}

const deliveryFee = 5
const registeredCoupons = [`kupon2024`, `niganiga`, `dumdumcoupon`]
const couponRedeemed = []

export default function App() {
  const [products, setProducts] = useState([])
  const [amount, setAmount] = useState(null)
  const [selected, setSelected] = useState('')
  const [sectionSelected, setSectionSelected] = useState('products')
  const [cart, setCart] = useState([])
  const [priceRangeSelected, setPriceRangeSelected] = useState(`All`)
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchedString, setSearchedString] = useState('')
  const [cartParams, setCartParams] = useState({})
  const [discount, setDiscount] = useState(0)
  const [inputCoupon, setInputCoupon] = useState(``)
  const [raiseError, setRaiseError] = useState({raise: false})
  const [checkOutLoading, setCheckOutLoading] = useState(false)
  const [checkOutResponse, setCheckOutResponse] = useState(null)


  // This useEffect is used to filter using user selected params
  useEffect(() => {
    // Filtering for search text
    let updatedFilteredProducts = products.filter(product => {
      if(product.productName.includes(searchedString)) return product
    })

    // Filtering for price range
    if(priceRangeSelected == `All`) {
      setFilteredProducts(updatedFilteredProducts)
      return
    }

    const range = parseRange(priceRangeSelected)
    updatedFilteredProducts = updatedFilteredProducts.filter(product => {
      if(product.productPrice > range.begin && product.productPrice <= range.end) return product
    })
    setFilteredProducts(updatedFilteredProducts)

  }, [priceRangeSelected, searchedString, products])


  useEffect(() => {
    async function fetchFromServer(){
      const response = await fetch(`https://dummy-ims-backend.onrender.com`, {
        method: `GET`,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      setProducts(data.products)
    }

    fetchFromServer()
  }, [])

  useEffect(() => {
    const updatedCartParams = {subTotal: cart.len==0? deliveryFee : 0}
    cart.forEach(product => {
      updatedCartParams.subTotal += (product.amountPurchased * product.productPrice)
    })

    setCartParams(updatedCartParams)
  }, [cart])


  function handleQnt(name, update){
    const updatedCart = [...cart]
    const index = updatedCart.findIndex(piece => piece.productName == name)
    updatedCart[index].amountPurchased = update
    setCart(updatedCart)
  }

  function handleRedeem(coupon){
    if(couponRedeemed.indexOf(coupon) != -1){
      setRaiseError({raise: true, errMsg: `Coupon already redeemed`})
      return
    }
    if(registeredCoupons.indexOf(coupon) == -1){
      setRaiseError({raise: true, errMsg: `Invalid coupon code`})
      return
    }

    couponRedeemed.push(coupon)
    setDiscount(prev => prev + 2)
  }

  function handleAmountInpChange(e, name){
    if(e.target.value < 0) return
    setSelected(name)
    setAmount(e.target.value)
  }

  function handleRemoveCart(name){
    setCart(prev => {
      const updatedCart = prev.filter(product => product.productName!=name)
      return updatedCart
    })
  }

  function handleAddCart(product, amount){
    if(product.productName != selected) return
    setCart(prev => {
      // Check & find the index of the adding product
      const index = prev.findIndex(piece => piece.productName == product.productName)

      if(index != -1){
        const updatedCart = [...prev]
        updatedCart[index].amountPurchased += amount
        return updatedCart
      }

      return [...prev, {productName: product.productName, imageURL: product.imageURL, productPrice: product.productPrice, amountPurchased: amount}]
    })
  }


  async function handleCheckOut(){
    if(cart.length == 0) return

    setCheckOutLoading(true)
    try{
      const bodyString = JSON.stringify({products: cart})
      const response = await fetch(`https://dummy-ims-backend.onrender.com`, {
        method: `POST`,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: bodyString
      })
  
      const responseData = await response.json()
      setCheckOutResponse(responseData)
      responseData.success && setCart([])
      console.log(responseData)
    }catch(err){
      console.log(err.message)
    }finally{
      setCheckOutLoading(false)
    }
  }

  return <div className='App'>

      <div className='navBar'>
        <div className='sect'>
          LOGO
        </div>
        <div className={sectionSelected == 'products' ? `sect selected` : `sect`} onClick={() => setSectionSelected(`products`)}>
          Products
        </div>
        <div className={sectionSelected == 'cart' ? `sect selected` : `sect`} onClick={() => setSectionSelected(`cart`)}>
          Cart
        </div>        
      </div>

      {sectionSelected==`products`?
        <div className='body-product'>  
          <div className='header'>
            Products
          </div>

          <div className='searchAndFilter'>
            <input value={searchedString} onChange={(e) => setSearchedString(e.target.value)} type='search' placeholder='Search for product by name'/>
            <Range selected={priceRangeSelected} handleSelected={setPriceRangeSelected} />
          </div>

          <div className='mappedProducts'>
            {
              filteredProducts.map(product => <div key={product.productName} className='card'>
                <h4>{product.productName}</h4>
                <img src={product.imageURL || `/avatar.png`} alt='' />
                <h5>Price: {product.productPrice}$</h5>
                <h5>In stock: {product.inStock > 100 ? `100+` : product.inStock}</h5>
                <div>
                  Amount: 
                  <input value={product.productName==selected && amount} type='number' onChange={(e) => handleAmountInpChange(e, product.productName)}/>
                </div>
                <button onClick={() => handleAddCart(product, Number(amount))}>Add to cart</button>
              </div>)
            }            
          </div>
        </div>
        :
        <div className='body-cart'>
          <div className='header'>
            Cart
          </div>

          <div className='cart'>
            <section></section>
            <h4>Name</h4>
            <h4>Quantity</h4>
            <section></section>
            <h4>Price</h4>

            {cart.length==0? <>
                <section></section>
                <section></section>
                <i>{`Your cart is empty! :<`}</i>
              </>
              :
              cart.map((product, index) => <React.Fragment key={index}>
                <div className='imgDiv'>
                  <img src={product.imageURL || `/avatar.png`} alt=''/>
                </div>
                <h5>{product.productName}</h5>
                <div className='qntDiv'>
                  <Quantity product={product} updateFunc={handleQnt}/>
                </div>
                <div className='btnDiv'>
                  <img src='/plus.png' alt='' onClick={() => handleRemoveCart(product.productName)}/>
                </div>
                <div className='priceDiv'>
                  <i>${product.productPrice}</i>
                </div>
              </React.Fragment>)
            }
          
          </div>
          <div className='cartParams'>
            <div><h5>Delivery fee</h5><i>${!cart.length==0 ? deliveryFee : 0}</i></div>
            <div><h5>Sub Total</h5><i>${cartParams.subTotal}</i></div>
            <div><h5>Discount</h5><i>{discount}%</i></div>
            <div><h5>Total</h5><i>${round(cartParams.subTotal*(1-(discount/100)))}</i><button onClick={() => handleCheckOut()}>{checkOutLoading ? <Spinner /> : `Check out`}</button></div>
          </div>
          <div className='redeemContainer'>
            <div className='redeem'>
              <input value={inputCoupon} onChange={e => {setInputCoupon(e.target.value);setRaiseError(false)}} type='text' placeholder='Enter a coupon code for discount' />
              <button onClick={() => handleRedeem(inputCoupon)}>redeem</button>
            </div>
            {raiseError.raise && <p style={{fontSize: `10px`, alignSelf: `flex-start`, color: `#d2cece`, backgroundColor: `#9c2b2e`, border: `1px solid #e84e4f`, margin: 0, padding: `5px`, borderRadius: `5px`}}>{raiseError.errMsg}</p>}
          </div>
          {
          checkOutResponse!=null &&
            <div className={checkOutResponse.success ? 'result success' : 'result fail'}>
              <p>{checkOutResponse.success ? `Products succesfully purchased & are on the way to delivery.` : `Purchase could not be made, please try again. Sorry for the inconvenience.`}</p>
              <img src='/plus.png' alt='' onClick={() => setCheckOutResponse(null)}/>
            </div>
          }
        </div>
        }        
    </div>
} 