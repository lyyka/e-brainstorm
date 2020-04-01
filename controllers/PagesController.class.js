class PagesController{
    index(req, res){
        res.render("index")
    }

    createSession(req, res){
        // if join try was successful
        let join_success = false;
        
        if(req.session == null || req.session.join_room_success == undefined){
            join_success = true;
        }
        else{
            join_success = req.session.join_room_success
        }
        
        req.session.join_room_success = undefined;
        res.render("queue", {
            join_success: join_success
        })
    }
}

module.exports = new PagesController()