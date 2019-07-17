      93Basic interpreter - by FranX1024

 - Introduction
 
   93Basic is a basic interpreter written in JS.
   To run your first program do the following:
	* make a file and give it extension .bas
	* open the file and save: alert "Hello world!"
	* to run it double click the file or click
      open with and 93Basic
	
 - Basic syntax

   In 93Basic each line is either a
   command (e.g. print), variable (e.g. myvar = ...),
   label (:label_name) or a comment (#...).
   (You can also leave lines blank).

   Labels and goto command can be used for going back to
   top or avoiding lines. There are also loops
   (e.g. for, while), but they won't work if they contain
   I/O commands (e.g. alert, input). In such cases labels
   should be used.

 - I/O commands

   * Alert launches a message box containing given text.
   Arguments of the command are separated by commas and all
   of them are shown as content of a message box.

   * Input launches an input box containing given text.
   It also saves input into a given variable.
   Syntax is input <var>, <text_to_show>

   * Print is a command which writes text to a terminal.
   Terminal will open only when this command is first called.
   It excepts same arguments as alert.

   * Clear clears the terminal and accepts no arguments.

 - Loops / labels / branching commands

   * If is a branching command which runs code following it
   in case that given condition is true.
   Syntax: if <condition> then <nl code nl> end
   NOTE: if command can be followed by an else instead and than
   else must be followed by end command.

   * For is a loop which runs as long as counter is smaller than
   limit. Syntax: for <var> = <value1> to <value2> do <nl code nl> end

   * While is a loop which runs as long as given condition is true
   Syntax: while <condition> do <nl code nl> end

   * Goto is a command used for reaching labels. Their position can be
   above and below the goto command.
   
   * Call is a command used for reaching labels. The difference from goto
   is that, when return is called, code keeps executing from the beginning.
   
   * Return is a command sort of already explained in previous point.
   
 - System commands
 
   * Load <var> <filename> is a command used for loading files
     into variables.
   
   * Save <filename> <text> is a command used for saving text to
     files.
	 
   * Exe <text> is same as typing /exe <text> in terminal.

 - Other

   * Var is a command used for defining variables, but it is not
   neccessary. Variables can be defined by simly typing
   following: <variable> = <content>

   * Append is a command used for appending lists, but they're still
   in development and a bit buggy, so they should be avoided.

   * Sleep is not really an I/O command, but it is also
   not usable in loops.

 - Keywords

   Keywords can show up in calculations such as 1 + 2 or
   something more like "fff" + "uuuu". They are short words
   with a ':' sign at the end. They apply only to the very next
   value (very next value can be content inside brackets).
   Currently there are 4 keywords:
	 len  - calculates length of a string or list
	 num  - turns string to number
	 str  - turns number to string
	 endl - behaves like a variable, doesn't require ':' at the end
   Example of their usage:   len: "String" + 12
							 25 + num: ("1" + "5")
							 "SUM: " + str: (1 + 2 + 3)
							 "Line 1" + endl + "Line 2"
							 
 - Usage of basic in other apps / adding commands
 
   To run basic code directly without saving it into a
   file run javascript $procedure(code).run(0).
   To add commands you need to save the procedure first
   and do the following: 
   
   var myprog = $procedure(code);
   myprog.commands.cmd_name = function(self, args, ln) {
       //self = myprog, e.g. self.vars = variables
	   //args = text after cmd_name
	   //ln = current line, returning something 
	   //else would mess with code execution
	   return ln; //to continue running the program
   }
   myprog.run(0);

================EXAMPLE PROGRAMS=======================

#Triangle program
input lns, "Number of lines: "
lns = num: lns
text = ""
for i = 0 to lns do
  for j = 0 to lns - i do
    text += " "
  end
  for j = 0 to i + 1 do
    text += "* "
  end
  text += endl
end
clear
print text

-----------------------------------------------

#Get square root
input n, "Enter a number: "
a = num: n
b = 2
c = 3
while b * b != a && b != c do
  c = b
  b = (b + a / b) / 2
end
alert "Square root of " + n + " is " + str: b

----------------------------------------------

#Get prime number less than n
input n, "Enter a number: "
b = 2
c = 3
while b * b != n && b != c do
  c = b
  b = (n / b + b) / 2
end
d = ""
for i = 0 to n do
  d += "-"
end
for i = 2 to b do
  if d[i] == "-" then
    for j = i + 1 to n do
      if j % i == 0 then
        d[j] = "+"
      end
    end
  end
end
s = ""
for i = 2 to n do
  if d[i] == "-" then
    s += str: i + ", "
  end
end
alert "Prime numbers less than ", n, " are: ", s

------------------------------------------------

#Example of call - return
for i = 0 to 10 do
  call sayhi
end
stop
:sayhi
print "hi!"
return
