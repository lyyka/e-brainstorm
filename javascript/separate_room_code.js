function separateRoomCode(code){
    let separated_room_code = ""
    for(let i = 0; i < code.length; i++){
        if(i % 2 == 0){
            separated_room_code += " "
        }
        separated_room_code += code[i]
    }
    return separated_room_code
}