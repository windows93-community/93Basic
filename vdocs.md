# Documentation for Vintage Basic Interpreter
## Introduction
This interpreter was made so older basic scripts could run on Windows93.
Therefore manual line indexing was requiered and everything has to be
written in uppercase.
A line can mean 2 things: it can be variable definition, e.g.
```basic
10 ABC = 10 + 3 * 2
```
or a command, e.g.
```basic
10 PRINT "Hello world!"
```
Available operators are AND, OR, NOT, +, -, *, /, ^, =, <=, >=, <, >, <>
Available built-in functions are:
 * CHR$(int)
 * MID$(string, int, int)
 * LEN(string)
 * TAB(int)
 * RND(int)  <- Random number generator

Available commands are:
 * PRINT ARG1 ; ARG2 ; ...
 * INPUT "TEXT" ; variable
 * FOR counter = start TO end
 * NEXT counter
 * POKE address, value
 * GOTO label
 * GOSUB label
 * RETURN
 * REM comment
 * IF condition THEN command

## "as" statement
```
value AS STRING/INT
```
