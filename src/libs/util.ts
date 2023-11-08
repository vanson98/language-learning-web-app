export const isNumeric = (value: any) : boolean =>{
    if(!isNaN(value) && !isNaN(parseFloat(value))){
        return true
    }
    return false
}

export const isStringNullOrEmpty = (value: any) : boolean =>{
    if(typeof(value) === "string" && value.trim().length === 0){
        return true
    }else if(value === null || value === undefined){
        return true
    }
    else{
        return false
    }
}