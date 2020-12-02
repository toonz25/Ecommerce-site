const { response } = require('express');
var express = require('express');
const productHelper = require('../helper/product-helper');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  productHelper.getALLproducts().then((product)=>{
    res.render('admin/view-product', { admins: true, product })
  })
  
});

router.get('/add-product', function (req, res) {
  res.render('admin/add-product' ,{ admins: true});
});
router.post('/add-product', (req, res) => {
  console.log(req.body);
  console.log(req.files.image);
  

  productHelper.addproduct(req.body, (id) => {
    //image passing part
    let image=req.files.image
   image.mv('./public/product-image/' + id + '.jpg', (err, done) => {
      if (!err) {
       res.render('admin/add-product')
      } else {
        console.log(err);
      }
    })
  })
})
router.get('/delete-product/:id',(req,res)=>{
let proid=req.params.id
console.log(proId)
productHelper.deletproduct(proid).then((response)=>{
res.redirect('/admin/')
})

})
router.get('/edit-product/:id',async(req,res)=>{
 let product= await productHelper.productdetails(req.params.id)
 console.log(product)
  res.render('admin/edit-product',{product})
})
router.post('/edit-product/:id',(req,res)=>{
  productHelper.updateproduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin')
    let id=req.params.id
    if(req.files.image){
      let image=req.files.image
    image.mv('./public/product-image/' + id + '.jpg')
    }
  })

})


module.exports = router;
