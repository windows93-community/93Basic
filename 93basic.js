/*Terminal feature*/
class $console {
	constructor(title) {
		this.el = document.createElement('div');
		this.el.style.width = '100%';
		this.el.style.height = '100%';
		this.el.style.backgroundColor = 'white';
		this.el.style.border = '2px inset';
		this.el.style.overflowY = 'auto';
		this.el.style.overflowX = 'hidden';
		this.el.style.font = '12px Consolas';
		
		$window({title: title}).el.body.appendChild(this.el);
		
		this.print = function(text) {
			this.el.innerText += text.split(' ').join(String.fromCharCode(160)) + '\n';
			this.el.scrollTop = this.el.scrollHeight;
		}
		
		this.input = function(text, cb, bas) {
			this.el.innerText += text.split(' ').join(String.fromCharCode(160));
			this.el.scrollTop = this.el.scrollHeight;
			var inp = document.createElement('input');
			inp.style.width = '50%';
			inp.style.outline = 'none';
			inp.style.border = 'none';
			inp.style.height = '12px';
			inp.style.font = '12px Consolas';
			var term = this;
			var calb = cb;
			inp.onkeydown = function(e) {
				if(e.keyCode == 13) {
					term.print(inp.value);
					calb(inp.value, bas);
				}
			}
			this.el.appendChild(inp);
			inp.select();
		}
	}
}

/*toVal is used for turning strings such as ' 1 + 2 + num : "34" ' to real values, on this example 37*/
/*Excepted operators: +, -, *, /, %,	Keywords: "str:", "num:", "len:"	Can work with brackets ()*/

function valueof(s, vars) {
	//remove all spaces except ones inside ""
	var quots = false;
	var nospaces = '';
	for(var i = 0; i < s.length; i++) {
		if(s[i] == '"') {
			quots = !quots;
			nospaces += s[i];
		} else {
			if(s[i] != ' ' || quots) {
				nospaces += s[i];
			}
		}
	}
	s = nospaces;
	
	quots = false;		//quotations
	var br = 0;			//Brackets
	
	//loop 1. 'and' and 'or'
	for(var i = 0; i < s.length; i++) {
		if(s[i] == '"') {
			quots = !quots;
		} else if(s[i] == '(' || s[i] == '[') {
			br++;
		} else if(s[i] == ')' || s[i] == ']') {
			br--;
		} else {
			if(br == 0 && !quots) {
				if(s[i] + s[i+1] == '||') {
					return valueof(s.slice(0, i), vars) || valueof(s.slice(i+2), vars);
				}
				if(s[i] + s[i+1] == '&&') {
					return valueof(s.slice(0, i), vars) && valueof(s.slice(i+2), vars);
				}
			}
		}
	}
	
	quots = false;
	br = 0;
	
	//loop 2. ==, !=, <=, >=, <, >
	for(var i = 0; i < s.length; i++) {
		if(s[i] == '"') {
			quots = !quots;
		} else if(s[i] == '(' || s[i] == '[') {
			br++;
		} else if(s[i] == ')' || s[i] == ']') {
			br--;
		} else {
			if(br == 0 && !quots) {
				if(s[i] + s[i+1] == '!=') {
					return valueof(s.slice(0, i), vars) != valueof(s.slice(i+2), vars);
				}
				if(s[i] + s[i+1] == '==') {
					return valueof(s.slice(0, i), vars) == valueof(s.slice(i+2), vars);
				}
				if(s[i] + s[i+1] == '<=') {
					return valueof(s.slice(0, i), vars) <= valueof(s.slice(i+2), vars);
				}
				if(s[i] + s[i+1] == '>=') {
					return valueof(s.slice(0, i), vars) >= valueof(s.slice(i+2), vars);
				}
				if(s[i] == '>') {
					return valueof(s.slice(0, i), vars) > valueof(s.slice(i+1), vars);
				}
				if(s[i] == '<') {
					return valueof(s.slice(0, i), vars) < valueof(s.slice(i+1), vars);
				}
			}
		}
	}
	
	quots = false;
	br = 0;
	
	//loop 3. addition and substraction
	for(var i = 0; i < s.length; i++) {
		if(s[i] == '"') {
			quots = !quots;
		} else if(s[i] == '(' || s[i] == '[') {
			br++;
		} else if(s[i] == ')' || s[i] == ']') {
			br--;
		} else {
			if(br == 0 && !quots) {
				if(s[i] == '+') {
					return valueof(s.slice(0, i), vars) + valueof(s.slice(i+1), vars);
				}
				if(s[i] == '%') {
					return valueof(s.slice(0, i), vars) % valueof(s.slice(i+1), vars);
				}
				if(s[i] == '-' && i != 0) {
					return valueof(s.slice(0, i), vars) + valueof(s.slice(i), vars);
				}
			}
		}
	}
	
	//loop 4. multiplication and division
	quots = false;
	br = 0;
	
	for(var i = 0; i < s.length; i++) {
		if(s[i] == '"') {
			quots = !quots;
		} else if(s[i] == '(' || s[i] == '[') {
			br++;
		} else if(s[i] == ')' || s[i] == ']') {
			br--;
		} else {
			if(br == 0 && !quots) {
				if(s[i] == '*') {
					return valueof(s.slice(0, i), vars) * valueof(s.slice(i+1), vars);
				}
				if(s[i] == '/') {
					return valueof(s.slice(0, i), vars) / valueof(s.slice(i+1), vars);
				}
			}
		}
	}
	
	//if there is a ! in front then just do the following
	if(s[0] == '!') {
		return !valueof(s.slice(1), vars);
	}
	if(s[0] == '-') {
		return -valueof(s.slice(1), vars);
	}
	
	if(s.substr(0, 4) == 'len:') {
		return valueof(s.slice(4), vars).length;
	}
	if(s.substr(0, 4) == 'str:') {
		return valueof(s.slice(4), vars).toString();
	}
	if(s.substr(0, 4) == 'num:') {
		return Number(valueof(s.slice(4), vars));
	}
	
	//Return raw value
	if(s[0] == '(' && s[s.length-1] == ')') {
		return valueof(s.slice(1, s.length-1), vars);
	} else if(Number(s).toString() == s) {
		return Number(s);
	} else if(s == 'true' || s == 'false') {
		return s == 'true'? true : false;
	} else if(s[0] == '"' && s[s.length-1] == '"'){
		return s.slice(1, s.length-1);
	} else {
		if(typeof vars == 'object' && s in vars) {
			return vars[s];
		} else if(typeof vars == 'object' && s.split('[')[0] in vars) {
			return vars[s.split('[')[0]][valueof(s.split('[').slice(1).join('[').slice(0, -1), vars)];
		} else {
			return ' - ERR: variable "' + s + '" does not exist.';
		}
	}
}

var toVal = valueof;
var condition = valueof;

/*getArgs seperates arguments using commas but not if they're under quotations,
 e.g. "ff,f", 12, "d", "f"  --->  ["ff,f", 12, "d", "f"] */
function getArgs(raw_args){
	let quots = false;
	var args = [''];
	for(let i = 0; i < raw_args.length; i++){
		if(raw_args[i] == '"'){
			quots = !quots;
			args[args.length-1] += raw_args[i];
		}else if(raw_args[i] == ',' && !quots){
			args.push('');
		}else{
			args[args.length-1] += raw_args[i];
		}
	}
	return args;
}

function Terminal() {
	$exe('terminal'); //Create a terminal
	var term = document.getElementsByTagName('code')[document.getElementsByTagName('code').length-1];
	return {
		'print': function(text) {
			term.innerText += text + '\n';
		},
		'clear': function() {
			term.innerText = '';
		}
	}
}

/*To create new $procedure do var myprog = new $procedure('Here goes code'); and to run it do myprog.run(0);*/
function $procedure(code){
	var code_ls = [''];
	var quots = false;
	for(var i = 0; i < code.length; i++) {
		if(code[i] == '"') {
			quots = !quots;
			code_ls[code_ls.length-1] += code[i];
		} else if(code[i] == '\n' || code[i] == ';' && !quots) {
			code_ls.push('');
		} else {
			code_ls[code_ls.length-1] += code[i];
		}
	}
	
	return {
		'vars': {'endl': '\n'},	//List of all variables
		'code': code_ls,		//List of code lines
		'calls': [],			//List of lines from which 
		'term': 0,
		'commands': {
			'var': (self, args, ln) => {
				var var_name = args.split('=')[0];
				if(args.slice(var_name.length+1).split(' ').join('')[0] != '['){
					var var_val = toVal(args.slice(var_name.length+1), self.vars);
				}
				var raw_val = args.slice(var_name.length+1);
				if(var_name.split('[').join('') == var_name){
					if(raw_val.split(' ').join('')[0] != '['){
						if("+-*/".indexOf(var_name[var_name.length-1]) == -1) {
							self.vars[var_name.split(' ').join('')] = var_val;
						} else {
							if(var_name[var_name.length-1] == '+') {
								self.vars[var_name.slice(0, var_name.length-1).split(' ').join('')] += var_val;
							}
							if(var_name[var_name.length-1] == '-') {
								self.vars[var_name.slice(0, var_name.length-1).split(' ').join('')] -= var_val;
							}
							if(var_name[var_name.length-1] == '/') {
								self.vars[var_name.slice(0, var_name.length-1).split(' ').join('')] /= var_val;
							}
							if(var_name[var_name.length-1] == '*') {
								self.vars[var_name.slice(0, var_name.length-1).split(' ').join('')] *= var_val;
							}
						}
					}else{
						var val_list = [''];
						var quots = false;
						for(let i = 0; i < raw_val.length; i++){
							if(raw_val[i] == '"'){
								quots = !quots;
								val_list[val_list.length-1] += '"';
							}else{
								if(!quots && raw_val[i] == ','){
									val_list[val_list.length-1] = toVal(val_list[val_list.length-1], self.vars);
									val_list.push('');
								}else{
									if(quots || (raw_val[i] != '[' && raw_val[i] != ']')){
										val_list[val_list.length-1] += raw_val[i];
									}
								}
							}
						}
						//val_list[val_list.length-1] = toVal(val_list[val_list.length-1], self.vars);
						if(raw_val.split(' ').join('') == '[]') {
							val_list = [];
						}
						self.vars[var_name.split(' ').join('')] = val_list;
					}
				}else{
					var place = toVal(var_name.split('[')[1].split(']')[0], self.vars);
					var_name = var_name.split(' ').join('').split('[')[0]; 
					self.vars[var_name] = self.vars[var_name].slice(0, place) + var_val + self.vars[var_name].slice(place+1);
				}
				return ln;
			},
			'append': (self, args, ln) => {
				var var_name = args.split(',')[0];
				var var_val = toVal(args.slice(var_name.length+1), self.vars);
				var nls = self.vars[var_name.split(' ').join('')];
				nls.push(var_val);
				self.vars[var_name.split(' ').join('')] = nls;
				return ln;
			},
			'print': (self, args, ln) => {
				if(self.term == 0) {
					self.term = new $console('V2 Basic'); 
				}
				args = getArgs(args);
				var text = "";
				for(i in args){
					text += toVal(args[i], self.vars);
				}
				self.term.print(text);
				return ln;
			},
			'alert': (self, args, ln) => {
				args = getArgs(args);
				var text = "";
				for(i in args){
					text += toVal(args[i], self.vars);
				}
				$alert(text, function() {
					self.run(ln+1);
				});
				return self.code.length;
			},
			'sleep': (self, args, ln) => {
				setTimeout(() => {
					self.run(ln+1);
				}, toVal(args, self.vars));
				/*To stop executing code from this point*/
				return self.code.length;
			},
			'goto': (self, args, ln) => {
				for(var i = 0; i < self.code.length; i++){
					if(self.code[i].split(' ').join('') == ':' + args.split(' ').join('')){
						return i;
					}
				}
				$alert('DAMN: cannot find requested place in memory, called at line ' + ln.toString());
				return self.code.length;
			},
			"input": (self, args, ln) => {
				if(self.term == 0) {
					self.term = new $console('V2 Basic'); 
				}
				var var_name = args.split(',')[0];
				var display_str = toVal(args.slice(var_name.length+1), self.vars);
				self.term.input(display_str, (input) => {
					if(var_name.split('[').join('') == var_name){
						self.vars[var_name.split(' ').join('')] = input;
					}else{
						var place = var_name.split('[')[1].split(']')[0];
						var_name = var_name.split(' ').join('').split('[')[0];
						if(typeof self.vars[var_name] == 'string'){
							self.vars[var_name] = self.vars[var_name].slice(0, place) + input + self.vars[var_name].slice(place+1);
						}else{
							var nls = self.vars[var_name];
							nls[place] = input;
							self.vars[var_name] = nls;
						}
					}
					self.run(ln+1);
				});
			},
			"prompt": (self, args, ln) => {
				var var_name = args.split(',')[0];
				var display_str = toVal(args.slice(var_name.length+1), self.vars);
				$prompt(display_str, (a, input) => {
					if(var_name.split('[').join('') == var_name){
						self.vars[var_name.split(' ').join('')] = input;
					}else{
						var place = var_name.split('[')[1].split(']')[0];
						var_name = var_name.split(' ').join('').split('[')[0];
						if(typeof self.vars[var_name] == 'string'){
							self.vars[var_name] = self.vars[var_name].slice(0, place) + input + self.vars[var_name].slice(place+1);
						}else{
							var nls = self.vars[var_name];
							nls[place] = input;
							self.vars[var_name] = nls;
						}
					}
					self.run(ln+1);
				});
				/*To stop executing code from this point*/
				return code.length;
			},
			"confirm": (self, args, ln) => {
				var var_name = args.split(',')[0];
				var display_str = toVal(args.slice(var_name.length+1), self.vars);
				$confirm(display_str, (input) => {
					if(var_name.split('[').join('') == var_name){
						self.vars[var_name.split(' ').join('')] = input;
					}else{
						var place = var_name.split('[')[1].split(']')[0];
						var_name = var_name.split(' ').join('').split('[')[0];
						if(typeof self.vars[var_name] == 'string'){
							self.vars[var_name] = self.vars[var_name].slice(0, place) + input + self.vars[var_name].slice(place+1);
						}else{
							var nls = self.vars[var_name];
							nls[place] = input;
							self.vars[var_name] = nls;
						}
					}
					self.run(ln+1);
				});
				/*To stop executing code from this point*/
				return code.length;
			},
			"if": (self, args, ln) => {
				/*e is the end of a substring which contains the condition*/
				let e = 0;
				/*con is the value of given condition*/
				let con = false;
				let quots = false;
				for(let i = 0; i < args.length; i++){
					if(args[i] == '"'){
						quots = !quots;
					}
					if((args + ' ').substr(i, 6) == ' then ' && !quots){
						con = condition(args.substr(0, i), self.vars);
					}
				}
				if(!con){
					/*br counts number of opened then-end or do-end structures*/
					let br = 1;
					for(let i = ln+1; i < self.code.length; i++){
						while(self.code[i][0] == ' '){
							self.code[i] = self.code[i].slice(1);
						}
						let s = self.code[i].split(' ').join('');
						if(self.code[i].split(' ')[0] == 'if'||self.code[i].split(' ')[0] == 'while'||self.code[i].split(' ')[0] == 'for'){
							br++;
						}
						if(self.code[i].split(' ')[0] == 'end'){
							br--;
							if(br == 0){
								return i;
							}
						}
						if(self.code[i].split(' ')[0] == 'else' && br == 1){
							return self.commands['else'](self, true, i);
						}
					}
					/******************************************************/
				}else{
					return ln;
				}
			},
			"else": (self, args, ln) => {
				if(args != true){
					/*br counts number of opened then-end or do-end structures*/
					let br = 1;
					for(let i = ln+1; i < self.code.length; i++){
						while(self.code[i][0] == ' '){
							self.code[i] = self.code[i].slice(1);
						}
						if(self.code[i].split(' ')[0] == 'if'||self.code[i].split(' ')[0] == 'while'||self.code[i].split(' ')[0] == 'for'){
							br++;
						}
						if(self.code[i].split(' ')[0] == 'end'){
							br--;
							if(br == 0){
								return i;
							}
						}
						if(self.code[i].split(' ')[0] == 'else' && br == 1){
							return self.commands['else'](self, true, i);
						}
					}
					/******************************************************/
				}else{
					return ln;
				}
			},
			"while": (self, args, ln) => {
				var quots = false;
				/*cond will save the condition so result of it can be checked each time loop starts*/
				var cond = '';
				for(let i = 0; i < args.length; i++){
					if(args[i] == '"'){
						quots = !quots;
					}
					if((args + ' ').substr(i, i+2) == ' do ' && !quots){
						cond = args.substr(0, i);
					}
				}
				var endloop = 0;
				/*br counts number of opened then-end or do-end structures*/
				let br = 1;
				for(let i = ln+1; i < self.code.length; i++){
					while(self.code[i][0] == ' '){
						self.code[i] = self.code[i].slice(1);
					}
					if(self.code[i].split(' ')[0] == 'if'||self.code[i].split(' ')[0] == 'while'||self.code[i].split(' ')[0] == 'for'){
						br++;
					}
					if(self.code[i].split(' ')[0] == 'end'){
						br--;
						if(br == 0){
							endloop = i;
							break;
						}
					}
				}
				/******************************************************/
				while(condition(cond, self.vars) == true){
					for(let i = ln+1; i < endloop; i++){
						/*Command and arguments are seperated by first space*/
						var command = self.code[i].split(' ')[0];
						var args = self.code[i].slice(command.length+1);
				
						/*if command is in commands then run it, otherwise it might be a variable*/
						if(command in self.commands){
							i = self.commands[command](self, args, i);
						}else if(self.code[i].indexOf('=') != -1){
							i = self.commands['var'](self, self.code[i], i);
						}else{
							if(command != ''){
								console.log('Line ' + (i+1).toString() + ', Error: unknown command or variable.');
							}
						}
					}
				}
				return endloop;
			},
			/*Syntax: for i = 0 to 10 do*/
			"for": (self, args, ln) => {
				var var_name = args.split('=')[0].split(' ').join('');
				var start_val = toVal(args.split('=')[1].split('to')[0], self.vars);
				var end_val = toVal(args.split('to')[1].split('do')[0], self.vars);
				/*Find end of loop*/
				var endloop = 0;
				/*br counts number of opened then-end or do-end structures*/
				let br = 1;
				for(let i = ln+1; i < self.code.length; i++){
					while(self.code[i][0] == ' '){
						self.code[i] = self.code[i].slice(1);
					}
					if(self.code[i].split(' ')[0] == 'if'||self.code[i].split(' ')[0] == 'while'||self.code[i].split(' ')[0] == 'for'){
						br++;
					}
					if(self.code[i].split(' ')[0] == 'end'){
						br--;
						if(br == 0){
							endloop = i;
							break;
						}
					}
				}
				/******************************************************/
				self.vars[var_name] = start_val;
				while(self.vars[var_name] < end_val){
					for(let i = ln+1; i < endloop; i++){
						/*Command and arguments are seperated by first space*/
						var command = self.code[i].split(' ')[0];
						var args = self.code[i].slice(command.length+1);
				
						/*if command is in commands then run it, otherwise it might be a variable*/
						if(command in self.commands){
							i = self.commands[command](self, args, i);
						}else if(self.code[i].indexOf('=') != -1){
							i = self.commands['var'](self, self.code[i], i);
						}else{
							if(command != ''){
								console.log('Line ' + (i+1).toString() + ', Error: unknown command or variable.');
							}
						}
					}
					self.vars[var_name]++;
				}
				return endloop;
			},
			/*execute a command*/
			'exe': (self, args, ln) => {
				$exe(valueof(args, self.vars));
				return ln;
			},
			/*Load a file into a string*/
			/*PATH: musn't have /a/ at the start*/
			'load': (self, args, ln) => {
				var var_name = args.split(',')[0];
				var display_str = toVal(args.slice(var_name.length+1), self.vars);
				$db.getRaw(display_str, (a, input) => {
					if(input == null) {
						input = $store.getRaw(display_str);
					}
					if(var_name.split('[').join('') == var_name){
						self.vars[var_name.split(' ').join('')] = input;
					}else{
						var place = var_name.split('[')[1].split(']')[0];
						var_name = var_name.split(' ').join('').split('[')[0];
						if(typeof self.vars[var_name] == 'string'){
							self.vars[var_name] = self.vars[var_name].slice(0, place) + input + self.vars[var_name].slice(place+1);
						}else{
							var nls = self.vars[var_name];
							nls[place] = input;
							self.vars[var_name] = nls;
						}
					}
					self.run(ln+1);
				});
				/*To stop executing code from this point*/
				return code.length;
			},
			'save': (self, args, ln) => {
				$db.set(valueof(args.split(',')[0], self.vars), valueof(args.split(',')[1], self.vars));
				return ln;
			},
			'return': (self, args, ln) => {
				return self.calls.pop();
			},
			'call': (self, args, ln) => {
				for(var i = 0; i < self.code.length; i++){
					if(self.code[i].split(' ').join('') == ':' + args.split(' ').join('')){
						self.calls.push(ln);
						return i;
					}
				}
				$alert('DAMN: cannot find requested place in memory, called at line ' + ln.toString());
				return self.code.length;
			},
			/*stop is used when there are labels with return in the program*/
			'stop': (self, args, ln) => {return self.code.length;},
			/*Command end is used to determine when a loop or if or else stops*/
			"end": (self, args, ln) => {return ln;}
			/*ADDITIONAL COMMANDS GO HERE*/
			
			/****************************/
		},
		'run'(start_point){
			for(var i = start_point; i < this.code.length; i++){
				/*Remove unneccecary spaces on the start of a line*/
				while(this.code[i][0] == ' '){
					this.code[i] = this.code[i].slice(1);
				}
				/*Command and arguments are seperated by first space*/
				var command = this.code[i].split(' ')[0];
				var args = this.code[i].slice(command.length+1);
				
				/*if command is in commands then run it, otherwise it might be a variable*/
				if(this.code[i][0] != '#' && this.code[i][0] != ':'){
					if(command in this.commands){
						i = this.commands[command](this, args, i);
					}else if(this.code[i].indexOf('=') != -1){
						i = this.commands['var'](this, this.code[i], i);
					}else{
						if(command != ''){
							i = this.commands['alert'](this, 'Line ' + (i+1).toString() + ', Error: unknown command.', i);
						}
					}
				}else if(this.code[i][0] == ':'){
					this.vars[this.code[i].slice(1)] = i;
				}
			}
		}
	}
}

le._apps.basic = {
	exec: function(url, opt) {
		path = this.arg.command.replace('basic ', '').replace('/a/', '').split('"').join('');
		//Turn "/a/desktop/file.bas" to desktop/file.bas
		console.log(path);
		$db.get(path, function(a, b) {
			if(typeof b == "string") {
				$procedure(b).run(0);
			} else {
				var f = $store.getRaw(path);
				if(typeof f == "string") {
					$procedure(f).run();
				}
			}
		});
	},
	name: "93Basic",
	icon: "/c/sys/skins/w93/type/json.png" //I will change the icon later
}

le._settings.defaultApp.wbs = 'basic';