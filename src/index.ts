import KalInterpreter from "../src/Kallipolis/KalIntepreter";
import VirtueRepl from "../src/Virtue/Repl";

let logo: string = `
                            ~      *
    *                   ~       ~
                    ~               ~
         *      ~                       ~
                ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~              *
     /\\         ~  K A L L I P O L I S  ~ 
    /  \\        ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~   
   /    \\       I       I       I       I 
  /      \\      |       |       |       |    
 /        \\     |       |       |       |    
 ----------     |       |       |       |
     ||         I       I       I       I           *
                ~~~~~~~~~~~~~~~~~~~~~~~~~
               / ------------------------ \\
              ~----------------------------~
            /  ---------------------------- \\
           ~---------------------------------~
`;

let tree = `
    /\\    
   /  \\   
  /    \\  
 /      \\ 
/        \\
---------- 
    ||     
`;

let repl = new VirtueRepl(
  new KalInterpreter(),
  "Kal> ",
  logo,
  tree
);

export { repl }