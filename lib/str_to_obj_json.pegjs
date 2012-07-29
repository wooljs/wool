/*
 * Copyright 2012 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 *      
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */
 
 
start
  = _ object:object { return object; }

object
  = "{" _ "}" _                 { return {};      }
  / "{" _ members:members "}" _ { return members; }

members
  = head:pair tail:("," _ pair)* {
      var result = {};
      result[head[0]] = head[1];
      for (var i = 0; i < tail.length; i++) {
        result[tail[i][2][0]] = tail[i][2][1];
      }
      return result;
    }

pair
  = name:key ":" _ value:value { return [name, value]; }

key
  = ident
  / string

ident
  = start:identStart parts:identPart* { return start+parts.join(""); }

identStart
  = [a-zA-Z$_]
  
identPart
  = [a-zA-Z$_0-9]

array
  = "[" _ "]" _                   { return [];       }
  / "[" _ elements:elements "]" _ { return elements; }

elements
  = head:value tail:("," _ value)* {
      var result = [head];
      for (var i = 0; i < tail.length; i++) {
        result.push(tail[i][2]);
      }
      return result;
    }

value
  = string
  / number
  / object
  / array
  / fun
  / "true" _  { return true;   }
  / "false" _ { return false;  }
  // FIXME: We can't return null here because that would mean parse failure.
  / "null" _  { return "null"; }

/* ===== Lexical Elements ===== */

string "string"
  = '"' '"' _             { return "";    }
  / "'" "'" _             { return "";    }
  / '"' chars:chars2q '"' _ { return chars; }
  / "'" chars:chars1q "'" _ { return chars; }
  
chars2q
  = chars:char2q+ { return chars.join(""); }

chars1q
  = chars:char1q+ { return chars.join(""); }
  
char2q
  // In the original JSON grammar: "any-Unicode-character-except-"-or-\-or-control-character"
  = [^"\\\0-\x1F\x7f]
  / '\\"'  { return '"';  }
  / "\\\\" { return "\\"; }
  / "\\/"  { return "/";  }
  / "\\b"  { return "\b"; }
  / "\\f"  { return "\f"; }
  / "\\n"  { return "\n"; }
  / "\\r"  { return "\r"; }
  / "\\t"  { return "\t"; }
  / "\\u" h1:hexDigit h2:hexDigit h3:hexDigit h4:hexDigit {
      return String.fromCharCode(parseInt("0x" + h1 + h2 + h3 + h4));
    }
  
char1q
  // In the original JSON grammar: "any-Unicode-character-except-"-or-\-or-control-character"
  = [^'\\\0-\x1F\x7f]
  / "\\'"  { return "'";  }
  / "\\\\" { return "\\"; }
  / "\\/"  { return "/";  }
  / "\\b"  { return "\b"; }
  / "\\f"  { return "\f"; }
  / "\\n"  { return "\n"; }
  / "\\r"  { return "\r"; }
  / "\\t"  { return "\t"; }
  / "\\u" h1:hexDigit h2:hexDigit h3:hexDigit h4:hexDigit {
      return String.fromCharCode(parseInt("0x" + h1 + h2 + h3 + h4));
    }

number "number"
  = int_:int frac:frac exp:exp _ { return parseFloat(int_ + frac + exp); }
  / int_:int frac:frac _         { return parseFloat(int_ + frac);       }
  / int_:int exp:exp _           { return parseFloat(int_ + exp);        }
  / int_:int _                   { return parseFloat(int_);              }

int
  = digit19:digit19 digits:digits     { return digit19 + digits;       }
  / digit:digit
  / "-" digit19:digit19 digits:digits { return "-" + digit19 + digits; }
  / "-" digit:digit                   { return "-" + digit;            }

frac
  = "." digits:digits { return "." + digits; }

exp
  = e:e digits:digits { return e + digits; }

digits
  = digits:digit+ { return digits.join(""); }

e
  = e:[eE] sign:[+-]? { return e + sign; }

/*
 * The following rules are not present in the original JSON gramar, but they are
 * assumed to exist implicitly.
 *
 * FIXME: Define them according to ECMA-262, 5th ed.
 */

digit
  = [0-9]

digit19
  = [1-9]

hexDigit
  = [0-9a-fA-F]
  
/**
 * Extends JSON with function definition
 */

fun
  = "function" _ name:fun_name "(" param:fun_param ")" _ "{" body:fun_body "}" _ {return new Function(param.join(','),body); }
	
fun_name
  = _ { return ""; }
  / ident:ident _ { return ident; }
  
fun_param
  = _				{ return []; }
  / idents:idents _ { return idents; }


idents
  = head:ident tail:("," _ ident)* {
      var result = [head];
      for (var i = 0; i < tail.length; i++) {
        result.push(tail[i][2]);
      }
      return result;
    }

fun_body
  = statements:statements _ { return statements.join("");}

statements
  = statements:( head:statement tail:(";" _ statement)* ) {
	  return statements;
	  /*
      var result = [head];
      for (var i = 0; i < tail.length; i++) {
        result.push(tail[i][0], tail[i][1], tail[i][2]);
      }
      return result;
      */
    }
  / statements:( head:statement tail:("\n" _ statement)* ){
	  return statements;
	  /*
      var result = [head];
      for (var i = 0; i < tail.length; i++) {
        result.push(tail[i][0], tail[i][1], tail[i][2]);
      }
      return result;
      */
    }

statement
  = simple_statement _
  / block_statement _ 

simple_statement
  = simple_statement:( head:term tail:(op _ term)* ) {
	  return simple_statement;
	  /*
      var result = [head];
      for (var i = 0; i < tail.length; i++) {
        result.push(tail[i][0], tail[i][1], tail[i][2]);
      }
      return result;
	   */
    }
    / simple_statement:("return" _ simple_statement) { return simple_statement; }

op
  = [-+*()\.]

term
  = ident
  / value

block_statement
  = block_statement:( block_holder "{" statements "}" ) { return block_statement; }
  
block_holder
  = _ {return "";}
  / if_def:( "if" _ "(" simple_statement ")" _ ) {return if_def;}

/* ===== Whitespace ===== */

_ "whitespace"
  = whitespace*

// Whitespace is undefined in the original JSON grammar, so I assume a simple
// conventional definition consistent with ECMA-262, 5th ed.
whitespace
  = [ \t\n\r]
