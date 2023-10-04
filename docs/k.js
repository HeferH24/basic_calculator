const DEL = 4; 
const RES = 20;  
const CLEAN = 1; 
const ERR = -1; 
let keys = document.getElementsByTagName("td"); 
let screen = keys[0];  
let screen_content = "";  

/*


Pseudocode:  
for ch in exp 
    if is a number  
        concatenate to the end exp 
    else if is an operator 
        if the current operator has lower precedence than the top of the stack
            flush the stack while the top has higher precedence (or while the current has lower)
        else 
            push the operator 

if the stack is not empty
    flush the stack to the end exp until is empty  

*/


// checks if the current op has lower precedence than the top of the stack
function lower_p(op, stack_op) {
    if(stack_op == '+' || stack_op == '-') {
        if(op == '+' || op == '-') {
            return true; 
        }
    } else if(stack_op == '/' || stack_op == '*') {
        // since we only have +, -, *, /, every of these would have lower p than the stack ones (/, *)
        return true; 
    }
    return false; 
}

 
// *ERROR CHECK FUNCTIONS: 
// 1. branching test
// 2. adyacent operator test
// 3. complete the zeros for the '-' operator and aply the counting test (for n numbers we need n-1 operators) 

// **********************************************************  
function branch_test(exp) {
    let stack = []; 
    for(let i = 0; i < exp.length; i++) {
        if(exp[i] == '(') {
            stack.push('('); 
        } else if (exp[i] == ')') {
            if(stack.length == 0) {
                return false;     
            }
            stack.pop(); 
        }
    }
    if(stack.length != 0) {
        return false
    }
    return true; 
}

function adyacent_test(exp) {
    for(let i = 0; i < exp.length; i++) {
        if (exp[i] != '(' && exp[i] != ')') { // using coercion 
            if(exp[i+1] != '(' && exp[i+1] != ')') {
                if(isNaN(exp[i]) && isNaN(exp[i+1])) { 
                    return false;   
                } 
            }
        }
    }
    return true; 
}

function counting_test(exp) {
    let num_operators = 0; 
    let num_operands = 0; 
    for(let i = 0; i < exp.length; i++) {
        if (exp[i] != '(' && exp[i] != ')') {
            if(!isNaN(exp[i])) { 
                while(!isNaN(exp[i]) || exp[i] == '.') {  // skiping the digits and going to the operator 
                    i++; 
                } 
                i--; 
                num_operands++; 
            } else 
                num_operators++; 
        }
    }
    if(num_operators == num_operands-1) {
        return true; 
    }
    return false; 
}

// we need to check if there is a number before and after '.' decimal point, if not we reject 

function decimal_test(exp) {
    for(let i = 0; i < exp.length; i++) {
        if(exp[i] == '.') {
            if(isNaN(exp[i-1]) || isNaN(exp[i+1])){
                return false; 
            }
        }
    }
    return true; 
}

// **********************************************************  
// la regla es que un operador tenga nos operandos
// ademas, independientemente de la precendencia, los operadores se aplican a los dos numeros previos
// de izquierda a derecha
// 3 * (1 + 4)
// 3 * 1 4 + 
// 3 1 4 + *  

function infix_to_pos(exp) {
    // necesitamos reemplazar todo por * y / cuando amerite
    let temp1 = ""; 
    for(let i = 0; i < exp.length; i++){
        if(exp[i] == '÷') {
            temp1 += '/'; 
        } else if(exp[i] == '×') {
            temp1 += '*'; 
        } else {
            temp1 += exp[i]; 
        }
    }
    exp = temp1;  
    let postfix = ""; 
    let stack = [];  
    let temp2 = ""; 

    if(!branch_test(exp)) {
        return ERR; 
    } 
    if (!adyacent_test(exp)) {
        return ERR; 
    }
    if(!decimal_test(exp)) {
        return ERR; 
    }
    if(exp[0] == '-') {
        exp = ('0' + exp);
    }

    // putting the 0 before the '-' : 
    for(let i = 0; i < exp.length; i++) {
        if(exp[i+1] == '-' && isNaN(exp[i]) && exp[i] != ')') {  // ')' because is not allowed to have things like ")0-2"
            temp2 += (exp[i] + '0'); 
        } else 
            temp2 += exp[i]; 
    }
    exp = temp2;
    if(!counting_test(exp)) {
        return ERR; 
    }

    for(let i = 0; i < exp.length; i++) {
        if(!isNaN(exp[i])) { // number by coercion ? 
            let temp = "";  
            while(!isNaN(exp[i]) || exp[i] == '.') {  // while the current char is a digit 
                temp += exp[i]; 
                i++; 
            }
            postfix += (temp + ',');
            // i-- so that it reads the operator on the next iteration, since at the end of this iteration we do i++ 
            i--; 
        } else if(exp[i] == ')') {
            while(stack[stack.length-1] != '(') { // end of sub expression  
                postfix += (stack.pop() + ',');  
            }
            stack.pop(); // removes '(' after reaching it 
        } else if(exp[i] == '(') {
            stack.push('('); 
        
        } else { // we got an actual operator  
            while(lower_p(exp[i], stack[stack.length-1])) { // works as condition also 
                postfix += (stack.pop() + ',');  
            } 
            stack.push(exp[i]); 
        }
    }
    while(stack.length != 0) {   // flushing everything   at the end 
        postfix += (stack.pop() + ','); 
    }
    return postfix; 
}


function evaluate_exp(exp) {
    let stack = [];  
    for(let i = 0; i < exp.length; i++) {
        if(!isNaN(exp[i])) {
            let num = ""; 
            while(exp[i] != ',') {
                num += exp[i]; 
                i++; 
            }
            stack.push(parseFloat(num));

        } else if(exp[i] != ','){
            let s_op = stack.pop();
            let f_op = stack.pop();
            switch (exp[i]) { // we put the result back to the stack, acumulating the result 
                case '+':
                    stack.push(f_op + s_op); 
                    break;
                case '-':
                    stack.push(f_op - s_op); 
                    break;
                case '*':
                    stack.push(f_op * s_op); 
                    break;
                case '/':
                    stack.push(f_op / s_op); 
                    break;
            }
        }
    }
    return stack[0]; 
}




//*EVENTS
//************************************************* */

for(let i = 1; i < keys.length; i++)  {
    if (i != DEL && i != RES && i != CLEAN){ // to avoid confusion 
        keys[i].addEventListener('click', function(){
            screen_content += keys[i].textContent; // goes tp a niffer 
            screen.textContent = screen_content; 
        });
    }
}

keys[DEL].addEventListener('click', function(){
    // subtring (incluido, no incluido) (en indices); substring (2, 4), ira desde el tercer elemento hasta el 4to (indice 3)
    screen_content = screen_content.substring(0, screen_content.length-1); 
    screen.textContent = screen_content; 
});

keys[RES].addEventListener('click', function(){
    let postfix = infix_to_pos (screen_content);  
    if (postfix == ERR) {  // error check 
        screen.textContent = "Error"; 
        screen_content = ""; 
    } else {
        let result = evaluate_exp(postfix);
        screen.textContent = result; 
        screen_content = ""; // reset 
        screen_content += result;  // maintain the result on the screen 
    }
});

keys[CLEAN].addEventListener('click', function() {
    screen.textContent = ""; 
    screen_content = ""; 
}); 