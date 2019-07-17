/*Console for $basic*/

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

/*Old basic interpreter (line numbers, next command, ...)*/
class $basic {
	constructor(raw_code) {
		this.code = []; //list of all code
		this.labs = []; //list of all labels
		this.call = []; //list of all calls made with GOSUB command
		this.fors = {}; //list of all for loops (looks like {counter_variable: [label, end_value]})
		this.memo = {}; //Fake memory (for peek and poke)
		this.vars = {};	//looks like {varname: varvalue}
		
		/*custom terminal for code execution*/
		this.term = new $console('Vintage Basic');
		
		/*here all commands are saved*/
		this.cmds = {
			/*Comment*/
			'REM': function(lab, bas, args) {
				return lab;
			},
			/*Print <arg1; arg2; arg3>*/
			'PRINT': function(lab, bas, args) {
				var quots = false;
				var arg = [""];
				for(var i = 0; i < args.length; i++) {
					if(args[i] == '"') {
						quots = !quots;
					}
					if(args[i] == ';' && !quots) {
						arg.push("");
					} else {
						arg[arg.length-1] += args[i];
					}
				}
				var s = "";
				for(var i = 0; i < arg.length; i++) {
					s += bas.getValue(arg[i]).toString();
				}
				bas.term.print(s);
				return lab;
			},
			'INPUT': function(lab, bas, args) {
				var text = '';
				var name = '';
				var passed = false;
				var quots = false;
				for(var i = 0; i < args.length; i++) {
					if(args[i] == '"') {
						quots = !quots;
					}
					if(args[i] == ';' && !quots) {
						passed = true;
						continue;
					}
					if(passed) {
						name += args[i];
					} else {
						text += args[i];
					}
				}
				bas.term.input(bas.getValue(text), (i, bas) => {
					bas.vars[name.split(' ').join('')] = i;
					bas.run(lab + 1);
				}, bas);
				return bas.code.length;
			},
			'GOTO': function(lab, bas, args) {
				return bas.labs.indexOf(bas.getValue(args)) - 1;
			},
			'GOSUB': function(lab, bas, args) {
				bas.call.push(lab);
				return bas.labs.indexOf(bas.getValue(args)) - 1;
			},
			'RETURN': function(lab, bas, args) {
				return bas.call.pop();
			},
			'IF': function(lab, bas, args) {
				var cond = '';
				var exec = '';
				var passed = false;
				var quots = false;
				for(var i = 0; i < args.length; i++) {
					if(args[i] == '"') {
						quots = !quots;
					}
					if(args.substr(i, 6) == ' THEN ') {
						passed = true;
						i += 5;
						continue;
					}
					if(passed) {
						exec += args[i];
					} else {
						cond += args[i];
					}
				}
				if(bas.getValue(cond)) {
					var cmd = exec.split(' ')[0];
					var nam = exec.split('=')[0];
					if(cmd != 'FOR' && cmd != 'IF' && nam.indexOf('"') == -1 && exec.indexOf('=') != -1) {
						/*Variable*/
						bas.vars[nam.split(' ').join('')] = bas.getValue(exec.slice(nam.length + 1));
					} else {
						/*Command*/
						if(cmd in bas.cmds) {
							return bas.cmds[cmd](lab, bas, exec.slice(cmd.length+1));
						} else {
							throw 'BasicError: "' + cmd + '" is not a command!';
						}
					}
				}
				return lab;
			},
			'POKE': function(lab, bas, args) {
				var add = '';
				var val = '';
				var quots = false;
				var passed = false;
				var br = 0;
				for(var i = 0; i < args.length; i++) {
					if(args[i] == '(') {
						br++;
					}
					if(args[i] == ')') {
						br--;
					}
					if(args[i] == '"') {
						quots = !quots;
					}
					if(args[i] == ',' && !quots && br == 0) {
						passed = true;
						continue;
					}
					if(passed) {
						val += args[i];
					} else {
						add += args[i];
					}
				}
				bas.memo[bas.getValue(add)] = bas.getValue(val);
				return lab;
			},
			'FOR': function(lab, bas, args) {
				var cnt = '';  //Counter name
				var bgn = '';  //First value
				var end = '';  //Ending value (last + 1)
				var step = ''; //Not mandatory, 1 by default
				var quots = false;
				var ld = 0;
				for(var i = 0; i < args.length; i++) {
					if(args[i] == '"') {
						quots = !quots;
					}
					if(args[i] == '=' && !quots) {
						ld = 1;
						continue;
					}
					if(args.substr(i, 4) == ' TO ' && !quots) {
						ld = 2;
						i += 3;
						continue;
					}
					if(args.substr(i, 6) == ' STEP ' && !quots) {
						ld = 3
						i += 5;
					}
					if(ld == 0) {
						cnt += args[i];
					}
					if(ld == 1) {
						bgn += args[i];
					}
					if(ld == 2) {
						end += args[i];
					}
					if(ld == 3) {
						step += args[i];
					}
				}
				bas.vars[cnt.split(' ').join('')] = bas.getValue(bgn);
				bas.fors[cnt.split(' ').join('')] = [lab, bas.getValue(end), (step == ''? 1 : bas.getValue(step))];
				return lab;
			},
			'NEXT': function(lab, bas, args) {
				if(bas.getValue(args) + bas.fors[args.split(' ').join('')][2] <= bas.fors[args.split(' ').join('')][1]) {
					bas.vars[args.split(' ').join('')] += bas.fors[args.split(' ').join('')][2];
					return bas.fors[args.split(' ').join('')][0];
				}
				return lab;
			},
			//Used for stopping program from executing any more
			'END': function(lab, bas, args) {
				return bas.labs[bas.labs.length-1];
			}
			/*Here all commands go...*/
		};
		
		/*Used for calculating or working with strings*/
		this.getValue = function(s) {
			/*-----Remove all useless spaces from the string-----*/
			
			var quots = false;	//char under quotes or not
			var sz = "";		//Temporary string for saving cleaned s
			for(var i = 0; i < s.length; i++) {
				/*in case of a keyword (e.g. as, or, and, not), spaces must be preserved*/
				if([' OR ', ' AS ', 'NOT '].indexOf(s.substr(i, 4)) != -1) {
					sz += s.substr(i, 4);
					i += 3;
					continue;
				}
				if(s.substr(i, 5) == ' AND ') {
					i += 3;
					sz += ' AND ';
					continue;
				}
				/*remove spaces unless they're under quotes*/
				if(s[i] == '"') {
					quots = !quots;
					sz += s[i];
				} else if(s[i] != ' ' || quots) {
					sz += s[i];
				} 
			}
			/*set s to sz*/
			s = sz;
			
			/*-----Start sreaching for operators-----*/
			
			var br = 0; //count number of open brackets
			
			/*first sreach for or*/
			for(var i = 0; i < s.length; i++) {
				if(s[i] == '(') {
					br++;
				}
				if(s[i] == ')') {
					br--;
				}
				if(s[i] == '"') {
					quots = !quots;
				}
				
				if(s.substr(i, 4) == ' OR ' && !br && !quots) {
					return this.getValue(s.slice(0, i)) || this.getValue(s.slice(i + 4));
				}
			}
			/*sreach for and*/
			for(var i = 0; i < s.length; i++) {
				if(s[i] == '(') {
					br++;
				}
				if(s[i] == ')') {
					br--;
				}
				if(s[i] == '"') {
					quots = !quots;
				}
				
				if(s.substr(i, 5) == ' AND ' && !br && !quots) {
					return this.getValue(s.slice(0, i)) && this.getValue(s.slice(i + 5));
				}
			}
			/*sreach for =, <>, <=, >=, <, >*/
			for(var i = 0; i < s.length; i++) {
				if(s[i] == '(') {
					br++;
				}
				if(s[i] == ')') {
					br--;
				}
				if(s[i] == '"') {
					quots = !quots;
				}
				
				if(!br && !quots) {
					if(s.substr(i, 2) == '<>') {
						return this.getValue(s.slice(0, i)) != this.getValue(s.slice(i + 2));
					}
					if(s.substr(i, 2) == '<=') {
						return this.getValue(s.slice(0, i)) <= this.getValue(s.slice(i + 2));
					}
					if(s.substr(i, 2) == '>=') {
						return this.getValue(s.slice(0, i)) >= this.getValue(s.slice(i + 2));
					}
					if(s[i] == '>') {
						return this.getValue(s.slice(0, i)) > this.getValue(s.slice(i + 1));
					}
					if(s[i] == '<') {
						return this.getValue(s.slice(0, i)) < this.getValue(s.slice(i + 1));
					}
					if(s[i] == '=') {
						return this.getValue(s.slice(0, i)) == this.getValue(s.slice(i + 1));
					}
				}
			}
			/*sreach for +, % and -*/
			for(var i = 0; i < s.length; i++) {
				if(s[i] == '(') {
					br++;
				}
				if(s[i] == ')') {
					br--;
				}
				if(s[i] == '"') {
					quots = !quots;
				}
				
				if(!br && !quots) {
					if(s[i] == '+') {
						return this.getValue(s.slice(0, i)) + this.getValue(s.slice(i + 1));
					}
					if(s[i] == '-' && i > 0) {
						return this.getValue(s.slice(0, i)) + this.getValue('-' + s.slice(i + 1));
					}
					if(s[i] == '%') {
						return this.getValue(s.slice(0, i)) % this.getValue(s.slice(i + 1));
					}
				}
			}
			/*sreach for *, / and ^ */
			for(var i = 0; i < s.length; i++) {
				if(s[i] == '(') {
					br++;
				}
				if(s[i] == ')') {
					br--;
				}
				if(s[i] == '"') {
					quots = !quots;
				}
				if(!br && !quots) {
					if(s[i] == '*') {
						return this.getValue(s.slice(0, i)) * this.getValue(s.slice(i + 1));
					}
					if(s[i] == '/') {
						return this.getValue(s.slice(0, i)) / this.getValue(s.slice(i + 1));
					}
					if(s[i] == '^') {
						return Math.pow(this.getValue(s.slice(0, i)), this.getValue(s.slice(i + 1)));
					}
				}
			}
			/*Now do keywords*/
			if(s.split('NOT ').length >= 2) {
				return !this.getValue(s.slice(4));
			}
			if(s[0] == '-') {
				return -this.getValue(s.slice(1));
			}
			/*If using one of the built in functions*/
			if(s.substr(0, 5) == 'CHR$(' && s[s.length-1] == ')') {
				return String.fromCharCode(this.getValue(s.slice(5, s.length-1)));
			}
			if(s.substr(0, 5) == 'MID$(' && s[s.length-1] == ')') {
				/*Mid is used for getting a substring from a string*/
				s = s.slice(5, s.length-1);
				var st = '';
				var c1 = '';
				var c2 = '';
				var elm = 0;
				var br = 0;
				var quots = false;
				for(var i = 0; i < s.length; i++) {
					if(s[i] == '(') {
						br++;
					}
					if(s[i] == ')') {
						br--;
					}
					if(s[i] == '"') {
						quots = !quots;
					}
					if(s[i] == ',' && !quots && br == 0) {
						elm++;
						continue;
					}
					if(elm == 0) {
						st += s[i];
					}
					if(elm == 1) {
						c1 += s[i];
					}
					if(elm == 2) {
						c2 += s[i];
					}
				}
				/*If only 2 arguments provided, show substring i, len(s)*/
				if(c2 == '') {
					return this.getValue(st).slice(this.getValue(c1));
				} else {
					return this.getValue(st).substr(this.getValue(c1), this.getValue(c2));
				}
			}
			if(s.substr(0, 5) == 'PEEK(' && s[s.length-1] == ')') {
				return this.memo[this.getValue(s.slice(5, s.length-1))] == undefined ? 0 : this.memo[this.getValue(s.slice(5, s.length-1))];
			}
			if(s.substr(0, 4) == 'LEN(' && s[s.length-1] == ')') {
				return this.getValue(s.slice(4, s.length-1)).length;
			}
			if(s.substr(0, 4) == 'TAB(' && s[s.length-1] == ')') {
				return '\t'.repeat(this.getValue(s.slice(4, s.length-1)));
			}
			if(s.substr(0, 4) == 'RND(' && s[s.length-1] == ')') {
				return Math.floor(Math.random()*this.getValue(s.slice(4, s.length-1)));
			}
			/*If code is in brackets*/
			if(s[0] == '(' && s[s.length-1] == ')') {
				return this.getValue(s.slice(1, s.length-1));
			}
			/*sreach for as statement*/
			var ind = -1;
			for(var i = 0; i < s.length; i++) {
				if(s.substr(i, 4) == ' AS ') {
					ind = i;
				}
			}
			if(ind != -1) {
				if(s.slice(ind + 4) == 'STRING') {
					return this.getValue(s.slice(0, ind)).toString();
				} else if(s.slice(ind + 4) == 'INT') {
					return Number(this.getValue(s.slice(0, ind)));
				} else {
					throw 'BasicError: "' + s.slice(ind + 4) + '" is not a type!';
				}
			}
			/*Now only raw value is left*/
			if(s in this.vars) {
				return this.vars[s];
			} else if(s[0] == '"' && s[s.length-1] == '"') {
				return s.slice(1, s.length-1);
			} else if(Number(s).toString() == s) {
				return Number(s);
			} else {
				throw 'BasicError: "' + s + '" does not exist!';
			}
		}
		
		/*This function executes the code*/
		this.run = function(x) {
			for(var i = x; i < this.code.length; i++) {
				var cmd = this.code[i].split(' ')[0];
				var nam = this.code[i].split('=')[0];
				if(cmd != 'FOR' && cmd != 'IF' && nam.indexOf('"') == -1 && this.code[i].indexOf('=') != -1) {
					/*Variable*/
					this.vars[nam.split(' ').join('')] = this.getValue(this.code[i].slice(nam.length + 1));
				} else {
					/*Command*/
					if(cmd in this.cmds) {
						i = this.cmds[cmd](i, this, this.code[i].slice(cmd.length+1));
					} else {
						throw 'BasicError(' + i + '): "' + cmd + '" is not a command!';
					}
				}
			}
		}
		
		/*split raw code by newline char*/
		var lines = raw_code.split('\n');
		/*if line numbered, save it under that number, otherwise throw error*/
		for(var i = 0; i < lines.length; i++) {
			var ln = lines[i].split(' ')[0];
			if(Number(ln).toString() != ln) {
				throw 'BasicError: "' + ln + '" is not a number!';
			}
			var cd = lines[i].slice(ln.length + 1);
			while(cd[0] == ' ') {
				cd = cd.slice(1);
			}
			while(cd[cd.length] == ' ') {
				cd = cd.slice(cd.length);
			}
			this.code.push(cd);
			this.labs.push(Number(ln));
		}
	}
}
/*Make it a win93 app*/
le._apps.basic = {
	exec: function(url, opt) {
		path = this.arg.command.replace('basic ', '').replace('/a/', '').split('"').join('');
		//Turn "/a/desktop/file.bas" to desktop/file.bas
		console.log(path);
		$db.get(path, function(a, b) {
			if(typeof b == "string") {
				new $basic(b).run(0);
			} else {
				var f = $store.getRaw(path);
				if(typeof f == "string") {
					new $basic(f).run();
				}
			}
		});
	},
	name: "VintageBasic",
	icon: "/c/sys/skins/w93/type/json.png" //I will change the icon later
}
le._settings.defaultApp.bas = 'basic';

/*
Below function turns

GOSUB TEST
END
TEST:
PRINT "HELLO"
RETURN

to

101 GOSUB 103
102 END
103 REM LABEL
104 PRINT "HELLO"
105 RETURN
*/

function $$compileBas(s) {
	var sz = '';
	var ln = s.split('\n');
	var labs = {};
	for(var i = 0; i < ln.length; i++) {
		if(ln[i] != '') {
			if(ln[i][ln[i].length-1] == ':') {
				labs[ln[i].slice(0, ln[i].length-1)] = (100 + i).toString();
				sz += (100 + i).toString() + ' REM LABEL\n';
			} else {
				sz += (100 + i).toString() + ' ' + ln[i] + '\n';
			}
		}
	}
	for(var item in labs) {
		sz = sz.split(item).join(labs[item].toString());
	}
	return sz.slice(0, sz.length-1);
}
le._apps.compilebas = {
	exec: function() {
		var en = document.createElement('textarea');
		var bt = document.createElement('button');
		bt.innerText = 'Compile';
		bt.onclick = function() {
			en.value = $$compileBas(en.value);
		}
		var win = $window({title: 'Compile to bas'});
		win.el.body.appendChild(en);
		win.el.body.appendChild(bt);
	}
}