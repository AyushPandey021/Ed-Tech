import{useDispatch, useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import{BuyCourse} from "../../../../Service/Operation/studentFeaturesAPI"


export default function RenderTotalAmount(){
    const {total,cart}=useSelector((state)=>state.cart)
    const{token}=useSelector((state)=>state.auth)
    const {user}=useSelector((state)=>state.profile)
    const navigate=useNavigate()
    const dispatch=useDispatch()


   const handleBuyCourse = () => {
  console.log("Buy Now clicked"); // Debug line
  const courses = cart.map((course) => course._id);
  BuyCourse(token, courses, user, navigate, dispatch);
};


   return(
    <div className='min-w-[280px] rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6'>
            <p className='mb-1 text-sm font-medium text-richblack-300'>Total:</p>
            <p className='mb-6 text-3xl font-medium text-yellow-100 '>₹ {total}</p>

               <button
  onClick={handleBuyCourse}
  className='w-full justify-center bg-yellow-100 text-black p-2 rounded'
>
  Buy Now
</button>


    </div>

   )





}
