var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

//INDEX - SHOW ALL CAMPGROUNDS
router.get("/campgrounds", function(req,res){
        var noMatch = "";
        if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        //get all campgrounds from DB
          Campground.find({name: regex}, function(err, allcampgrounds){
         if(err){
             console.log(err);
         }else{
             
             if(allcampgrounds.length < 1){
                 var noMatch = "No campgrounds match that query, please try again."
             }
             res.render("campgrounds/index",{campgrounds: allcampgrounds, noMatch: noMatch, page: "campgrounds"}); 
         }
     }); 
     
    }else{
         Campground.find({}, function(err, allcampgrounds){
         if(err){
             console.log(err);
         }else{
             res.render("campgrounds/index",{campgrounds: allcampgrounds, noMatch: noMatch, page: "campgrounds"}); 
         }
    });
    }
});
//CREATE -  ADD NEW CAMPGROUND TO DB
router.post("/campgrounds", middleware.isLoggedIn, function(req,res){
   var name   = req.body.name;
   var price  = req.body.price;
   var image  = req.body.image;
   var desc   = req.body.description;
   var author = {
       id: req.user._id,
       username: req.user.username
   };
   var newCampground = {name: name, price: price, image: image, description: desc, author: author };
   //create a new campground and save to DB
   Campground.create(newCampground, function(err, newlyCreated){
      if(err){
          console.log(err);
      } else{
          res.redirect("/campgrounds");
      }
   });
});
//NEW - SHOW FORM TO CREATE NEW CAMPGROUND
router.get("/campgrounds/new", middleware.isLoggedIn, function(req,res){
   res.render("campgrounds/new.ejs"); 
});

//SHOW - SHOWS MORE INFO ABOUT ONE CAMPGROUND
router.get("/campgrounds/:id", function(req,res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        }else{
            console.log(foundCampground);
            //render show template with that campground
             res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});
//Edit campground route
router.get("/campgrounds/:id/edit", middleware.checkCampgroundOwnership, function(req,res){
          Campground.findById(req.params.id, function(err,foundCampground){
              if(err){
                  req.flash("error", "Campground not found");
              }else{
                     res.render("campgrounds/edit",{campground: foundCampground});
              }
    });
});

//update campground route
router.put("/campgrounds/:id",middleware.checkCampgroundOwnership, function(req,res){
    //find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            res.redirect("/campgrounds");
        }else{
            //redirect(show page)
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
    
});

//destroy campground route
 router.delete("/campgrounds/:id",middleware.checkCampgroundOwnership, function(req,res){
     Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        } else{
            res.redirect("/campgrounds");
        }
     });
 });


function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;