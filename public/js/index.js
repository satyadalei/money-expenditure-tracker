function checkpsw(){ 
    document.getElementById("submit").disabled = false ;
    if(document.getElementById("psw").value === document.getElementById("confirmpsw").value){ 
         document.getElementById("confirm_msg").innerHTML = "Password Matched" ;    
         document.getElementById("confirm_msg").style.color = "green" ;
    }else{ 
      document.getElementById("confirm_msg").innerHTML = "Password did not Matched";   
      document.getElementById("confirm_msg").style.color = "red"; 
      document.getElementById("confirm_msg").style.fontWeight = "bold"; 
       document.getElementById("submit").disabled = true ;
     } 
} 
