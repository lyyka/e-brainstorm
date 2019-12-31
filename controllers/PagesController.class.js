class PagesController{
    index(req, res){
        res.render("index")
    }

    createSession(req, res){
        res.render("queue")
    }
}

module.exports = new PagesController()