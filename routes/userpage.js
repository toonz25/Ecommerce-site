const { response } = require('express');
var express = require('express');
var router = express.Router();
const productHelper = require('../helper/product-helper');
const userHelper = require('../helper/user-helper');
const userhelper=require('../helper/user-helper');
const verifylogin=(req,res,next)=>{
if(req.session.loggedin){
  next()
}else{
  res.redirect('/login')
}
}
/* GET home page. */
router.get('/',async function (req, res, next) {
let user=req.session.user
console.log(user)
let cartcount=null
if(req.session.user){
  cartcount=await userHelper.getcartcount(req.session.user._id)

}

  productHelper.getALLproducts().then((product) => {
    res.render('partials/user/view-products', { admins: false, product,user,cartcount })
  })
});
router.get('/login', (req, res) => {
  if(req.session.loggedin){
    res.redirect('/')
  }else{
    res.render('partials/user/login',{"loginerr":req.session.loginerr})
    req.session.loginerr=false
  }
 
})
router.get('/signup', (req, res) => {
  res.render('partials/user/signup')
})
router.post('/signup', (req, res) => {
  userhelper.doSignup(req.body).then((response) => {
    console.log(response);
    req.session.loggedin=true
    req.session.user=response
  })
})
router.post('/login',(req,res)=>{
userhelper.doLogin(req.body).then((response)=>{
 if(response.status) {
   req.session.loggedin=true
   req.session.user=response.user
  res.redirect('/')
 }else{
   req.session.loginerr="Invalide user name or password"
   res.redirect('/login')
 }
})
})
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})
router.get('/cart',verifylogin,async(req,res)=>{
  let product=await userHelper.getcartproducts(req.session.user._id)
  console.log(product)
  res.render('partials/user/cart',{product,user:req.session.user})
})
router.get('/add-to-cart/:id',verifylogin,(req,res)=>{
userhelper.addtocart(req.params.id,req.session.user._id).then(()=>{
  res.redirect('/')
})
})

module.exports = router;
