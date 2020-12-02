var db = require('../config/connection')
var collection = require('../config/connections')
const bcrypt = require('bcrypt')
const { resolve, reject } = require('promise')
const connections = require('../config/connections')
const { response } = require('express')
const { ObjectId } = require('mongodb')
var ObjectID = require('mongodb').ObjectID



module.exports = {


    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {

                resolve(data.ops[0])
            })

        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginstatus=false
            let response={}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log('login success full')
                        response.user=user
                        response.status=true
                        resolve(response)

                     }else{
                        console.log('login fail')
                        resolve({status:false})
                    }
                })
            }else{
                console.log('login fail')
                resolve({status:false})
            }
        })
    },
    addtocart:(proid,userid)=>{
        return new Promise(async(resolve,reject)=>{
            let usercart= await db.get().collection(connections.CART_COLLECTION).findOne({user:ObjectID(userid)})
            if(usercart){
                db.get().collection(connections.CART_COLLECTION)
                .updateOne({user:ObjectID(userid)},
                {
                    $push:{product:ObjectId(proid)}
                }
                ).then((response)=>{
                    resolve()

                })

            }else{
                let cartobj={
                    user:ObjectID(userid),
                    product:[ObjectID(proid)]
                }
                db.get().collection(connections.CART_COLLECTION).insertOne(cartobj).then((response)=>{
                    resolve()
                })
            }
            
        })
    },
    getcartproducts:(userid)=>{
        return new Promise(async(resolve,reject)=>{
            let cartitems=await db.get().collection(connections.CART_COLLECTION).aggregate([
                {
                    $match:{user:ObjectId(userid)}
                },
              {
                  $lookup:{
                      from:connections.PRODUCT_COLLECTION,
                      let:{prolist:'$product'},
                      pipeline:[
                          {
                              $match:{
                                  $expr:{
                                      $in:['$_id',"$$prolist"]
                                  }


                              }
                          }
                      ],
                      as:'cartitems'
                  }
              }
            ]).toArray()
            resolve(cartitems[0].cartitems)
        })


    },
    getcartcount:(userid)=>{
        return new Promise(async(resolve,reject)=>{
            let count=0
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectID(userid)})
            if(cart){
                count=cart.product.length
            }resolve(count)
        })
    }
}
