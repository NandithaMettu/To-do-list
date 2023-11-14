import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from 'lodash';
mongoose.connect("mongodb://127.0.0.1:27017/todoDB", { useNewUrlParser: true });




const itemSchema = new mongoose.Schema({
    name: String,
  });
  const listSchema = new mongoose.Schema({
    name: String,
    item:[itemSchema],
  });

 
  const Item = new mongoose.model("Item", itemSchema);
  const List=new mongoose.model("List", listSchema);
 
  const item1 = new Item({
    name: "Welcome to your todolist!",

  });
  const item2 = new Item({
    name: "Hit the + button to add a new item",

  });
  const item3 = new Item({
    name: "<--Hit this to delete an item",

  });
 /* Item.insertMany([item1,item2])
      .then(function(){
        console.log("successfully saved to database")
      })
      .catch(function(err){
        console.error(err)
      });*/



const app = express();
const port = 3000;
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));



 

app.get("/", (req, res) => {
    let options={weekday:"long",month:"long",day:"numeric"}
    let today= new Date();
    let day= today.toLocaleDateString("en-US",options);
    Item.find({}).then(function(foundItems){
        
      if(foundItems.length === 0) {

        Item.insertMany([item1,item2,item3])
        .then(function(){
          console.log("successfully saved to database")
        })
        .catch(function(err){
          console.error(err)
        });
        res.redirect("/");

      }
      else{
        res.render("home.ejs",{
        
          listitems1:foundItems,
         
          day:day
      });

      }              
      })
      .catch(function(err){
        console.log(err);
      }); 
        

});
app.get("/:customlistname",(req,res)=>{
  const customlistname = _.capitalize(req.params.customlistname);
  List.findOne({name:customlistname})
    .then(function(foundList){
        
          if(!foundList){
            const list = new List({
              name:customlistname,
              item: [item1,item2,item3]
            });
          
            list.save();
            console.log("saved");
            res.redirect("/"+customlistname);
          }
          else{
            res.render("home.ejs",{
        
              listitems1:foundList.item,
             
              day:foundList.name
          });
          }
    })
    .catch(function(err){});
 
})
    
  

app.post("/add",(req,res)=>{
    const newitem = req.body.item;
    const listName = req.body.submit;
    let options={weekday:"long",month:"long",day:"numeric"}
    let today= new Date();
    let day= today.toLocaleDateString("en-US",options);
 
  const item4 = new Item({
    name: newitem
  });
 
  if (listName == day) {
    item4.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName })
      .then((foundList) => {
        foundList.item.push(item4);
        foundList.save();
        res.redirect("/" + listName);
      })
      .catch((err) => {
        console.error(err);
      });
  }
   
})  


app.post("/delete",function(req,res){
  const checkedItemID= req.body.check;
  const listname=req.body.lists;
  let options={weekday:"long",month:"long",day:"numeric"}
  let today= new Date();
  let day= today.toLocaleDateString("en-US",options);
  if (listname == day) {
    Item.findByIdAndRemove(checkedItemID)
.then(function () {
    console.log("Successfully removed");
    res.redirect("/");
})
.catch(function (err) {
    console.log(err);
});

   
  } else {
    List.findOneAndUpdate({ name: listname },{$pull:{item:{_id:checkedItemID}}})
      .then((foundList) => {
        res.redirect("/" + listname);
      })
      .catch((err) => {
        console.error(err);
      });
  }


  


})
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });