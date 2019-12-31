class CookieHandler{
    add_cookie(name, value, doc){
        const current = doc.cookie
        doc.cookie = `${name}=${value}; ` + current
    }

    get_cookie(name, doc){
        const cookies = doc.cookie
        const splitted = cookies.split(";")
        let res = undefined
        splitted.forEach(cookie => {
            const splitted_by_eq_sign = cookie.trim().split("=")
            if(splitted_by_eq_sign[0] == name){
                res = splitted_by_eq_sign[1]
            }
        });
        return res
    }
}