---
date: 2009-12-06T00:00:00Z
meta:
  _edit_last: "1"
  _edit_lock: "1265429985"
published: true
status: publish
tags:
- filter
- lambda
- map
- python
- reduce
- sort
- Tutorials
title: Lambda Functions
type: post
url: /2009/12/06/lambda-functions/
---

One day, a friend of mine called me up asking for help with his CS assignment. 
It was about lambda functions in scheme. Lambda functions had always been 
something confusing both in theory and practice for me. Why do you need them? 
Before I explain what they are, I'll start with a simple probably justifying 
_why_ they are.

All code in this post is going to be in python, but most of it can be applied to 
other high level languages. I've only used lambda functions in python and 
scheme, but I'm sure the functionality exists in many, many other languages. 

Sorting
=======

Sorting in python is very straight forward. If I have a list of strings in python and want to sort them, I do this:

```python
a = ["banana","apple","pear","elephant","zebra","mango"]
a.sort()
print a
# OUT: ['apple', 'banana', 'elephant', 'mango', 'pear', 'zebra']
```

But what happens when you try to sort a list of words containing capital letters?

```python
a = ["pear","Police","apple","Airplane","banana","Bear"]
a.sort()
print a
# OUT: ['Airplane', 'Bear', 'Police', 'apple', 'banana', 'pear']
```

The sorting is done purely based on the byte values of the characters. Since 'P' 
(ASCII 80) < 'a' (ASCII 97), "Police" is placed before "apple" in the list of 
words. Normally when you're trying to sort a list of words, you want to do it 
alphabetically. So how do you fix this? You make a comparator function. Here's 
python's definition of the sort function.

```python
L.sort(cmp=None, key=None, reverse=False) -- stable sort *IN PLACE*;
cmp(x, y) -> -1, 0, 1
```

For those of you who have used `qsort` in the standard C library, this isn't 
such an arcane concept. In python however, it is much easier (no `void*` 
madness).

```python
def alphacmp(x,y):
    return cmp(x.lower(),y.lower())

a = ["pear","Police","apple","Airplane","banana","Bear"]
a.sort(alphacmp)
print a
# OUT: ['Airplane', 'apple', 'banana', 'Bear', 'pear', 'Police']
```

Okay, great! We now have our list sorted in the intuitive way. The lower() 
function will ensure that the lowercase version of the strings are being 
compared, removing the issues of the byte comparisons. But this code seems a 
little longer than it could be. Normally, you wouldn't create a function for 
task you do only once if it was just as readable within the code body. But the 
sort function needs a comparator function. So how can you give sort a comparator 
function without having to actually declare a function? The answer is lambda 
functions.

Lambda Functions
================

Lambda functions are anonymous functions. What does that mean? They're functions 
without a declared name. Let's look at an example so you can see what I mean. In 
the above example, we can sort alphabetically without defining the `alphacmp` 
function like so:

```python
a = ["pear","Police","apple","Airplane","banana","Bear"]
a.sort(lambda x,y: cmp(x.lower(),y.lower()))
print a
# OUT: ['Airplane', 'apple', 'banana', 'Bear', 'pear', 'Police']
```


So what does lambda x,y: cmp(x.lower(),y.lower()) mean? "lambda" says that the 
statements following define an anonymous function. "x,y:" defines the parameter 
list accepted by the anonymous function. "cmp(x.lower(),y.lower())" defines the 
return value for the lambda function. If you're still a little bit confused, 
read on for many many more examples. At some point, it will likely click and 
you'll see how valuable lambda really is.

Another sorting example: what if I want to sort by length of the strings instead of alphabetically? Easily done with lambda.

```python
a = ["pencil","pen","cap","zebra","Blizzard","0xB4DC0DE","!"]
a.sort(lambda x,y: len(x) - len(y))
print a
# OUT: ['!', 'pen', 'cap', 'zebra', 'pencil', 'Blizzard', '0xB4DC0DE']
```

The use of lambda functions makes the use of many higher level functions much nicer. I'll be outlining a few of them here.

map
===

>   map(function, sequence[, sequence, ...]) -> list
>
>   Return a list of the results of applying the function to the items of
>   the argument sequence(s).  If more than one sequence is given, the
>   function is called with an argument list consisting of the corresponding
>   item of each sequence, substituting None for missing values when not all
>   sequences have the same length.  If the function is None, return a list of
>   the items of the sequence (or a list of tuples if more than one sequence).

More or less, what map does is apply a function on every element of an array 
then return an array of the corresponding return values.

A very simple use for map would be making every word in a list upper case.

```python
a = ["abc","cattle","not even if there's a FIRE","Jeymi!?"]
b = map(lambda x: x.upper(),a)
print b
# OUT: ['ABC', 'CATTLE', "NOT EVEN IF THERE'S A FIRE", 'JEYMI!?']
```

A more useful example involves printing out grids. Say I have a matrix of 
numbers, represented as a list of lists in python. The default output formatting 
for this in python is extremely difficult to look at.

```python
a = [
    [1,212,-13],
    [41,5,614],
    [7,8,91]
]
print a
# OUT: [[1, 212, -13], [41, 5, 614], [7, 8, 91]]
```

What would be better is to output one row per line.

```python
a = [
    [1,212,-13],
    [41,5,614],
    [7,8,91]
]
print "\n".join(map(lambda x: str(x), a))
#OUT:
# [1, 212, -13]
# [41, 5, 614]
# [7, 8, 91]
```

_The join function concatenates a list of string, separating the elements with
the separator character - in this case: "\n"_

Much better! But what would be even better would be to print out the numbers in 
columns that line up nicely too.

```python
a = [
    [1,212,-13],
    [41,5,614],
    [7,8,91]
]
print "\n".join(
    map(
        lambda row:
            " ".join(map(
                lambda y: "%4d" % y,
                row
            )),
        a
    )
)
# OUT:
#   1  212  -13
#  41    5  614
#   7    8   91
```

`"%4d" % y` is applying the formatting string `%4d` to `y`, much the same way 
that `printf` in C and php do

Now, using a lambda function inside of a lambda function is less than readable, 
so I'll write out what this function does first without the maps and lambdas.

```python
a = [
    [1,212,-13],
    [41,5,614],
    [7,8,91]
]

def rowformat(row):
    formatted_cells = []
    for element in row:
        formatted_cells.append("%4d" % element)
    return " ".join(formatted_cells)

formatted_rows = []
for row in a:
    formatted_rows.append(rowformat(row))

print "\n".join(formatted_rows)
# OUT:
#   1  212  -13
#  41    5  614
#   7    8   91
```

In this case, `rowformat(row)` plays the exact same roles as `lambda row:`.

filter
======

>   filter(function or None, sequence) -> list, tuple, or string
>
>   Return those items of sequence for which function(item) is true.  If
>   function is None, return the items that are true.  If sequence is a tuple
>   or string, return the same type, else return a list.

The filter function does just what it's name suggests: filters out items that 
don't meet certain requirements. Specifically, any element which does not 
evaluate to true when passed to the provided function will be discarded. Note 
that this is _not_ in place - it returns the filtered list.

Example: remove all odd numbers from a list of numbers

```python
a = [1,2,5,0,-15,100,1400,-1337,135]
a = filter(lambda x: x % 2 == 0, a)
print a
# OUT: [2, 0, 100, 1400]
```

Example: remove all vowels from a string

```python
a = "Hello there! My name is Jamie, not to be confused with Jeymi."
a = "".join(filter(lambda x: "aeiou".find(x) == -1, list(a)))
print a
# OUT: Hll thr! My nm s Jm, nt t b cnfsd wth Jym.
```

Example: build a list of all prime numbers between 0 and 100 inclusive

```python
# NOTE: This prime test is inefficient - used for readability)
def isprime(x):
    if (x < 2):
        return False
    for i in range(2,x):
        if (x % i == 0):
            return False
    return True

print filter(isprime,range(101))
# OUT (placed on multiple lines for readability)
# [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 
# 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]
```

reduce
======

>   reduce(function, sequence[, initial]) -> value
>
>   Apply a function of two arguments cumulatively to the items of a sequence,
>   from left to right, so as to reduce the sequence to a single value.
>   For example, reduce(lambda x, y: x+y, [1, 2, 3, 4, 5]) calculates
>   ((((1+2)+3)+4)+5).  If initial is present, it is placed before the items
>   of the sequence in the calculation, and serves as a default when the
>   sequence is empty.

Example: Calculate 30 factorial without using local variables

```python
# Note that range(2,n) -> [2,3,...,n-1]
print reduce(lambda x,y: x*y, range(2,31))
# OUT: 265252859812191058636308480000000
```

Example: Find the longest word in a list of words

```python
a = ["pencil","pen","cap","zebra","Blizzard","0xB4DC0DE","!"]
print reduce(lambda x,y: y if len(y) > len(x) else x, a)
# OUT: 0xB4DC0DE
```

And that's all for now. If you're in SE 2014 reading this and don't think you need to know how to use lambda functions - have fun with scheme.
