import KalInterpreter from "../src/Kallipolis/KalIntepreter";
import VirtueRepl from "../src/Virtue/Repl";

let logo: string = `
                            ~      *
                          ~   ~
                        ~       ~
                      ~  /-----\\  ~         
                    ~   (       )   ~
       *          ~      \\-----/      ~ 
                ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~              *
                ~  K A L L I P O L I S  ~ 
                ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
                |       |       |       |    
                |       |       |       |
                |       |       |       |           *
                ~~~~~~~~~~~~~~~~~~~~~~~~~
 *             / ----------------------- \\
              ~----------------------------~
            /  --------------------------- \\
           ~---------------------------------~
`;

let repl = new VirtueRepl(
  new KalInterpreter(),
  "Kal> ",
  logo
);

export { repl }