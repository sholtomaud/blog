---
date: 2010-10-16T00:00:00Z
meta:
  _edit_last: "1"
  _edit_lock: "1287296820"
  _wp_old_slug: ""
published: true
status: publish
tags:
- cs241
- dot
- graphviz
- ruby
- school
title: DFAs and Graphviz DOT
type: post
url: /2010/10/16/dfas-and-graphviz-dot/
---

As is usually the case with CS assignments, I tend to focus on reducing debugging time as much as possible by spending time coding things to make my life (and hopefully yours) easier.

On the latest assignment we are required to describe DFAs (Deterministic Finite Automatas) in a [format][] with very low human readability, I knew immediately that I was going to write something to allow me to write my DFAs in a more human readable format so that I could sanely debug them. So instead of this:

    2
    0
    1
    5
    start
    zero
    0mod3
    1mod3
    2mod3
    start
    2
    zero
    0mod3
    8
    start 0 zero
    start 1 1mod3
    1mod3 0 2mod3
    1mod3 1 0mod3
    2mod3 0 1mod3
    2mod3 1 2mod3
    0mod3 0 0mod3
    0mod3 1 1mod3

I can do this in Ruby:

```ruby
dfa = {
  :alphabet => %w(
    0
    1
  ),
  :states => %w(
    start
    zero
    0mod3
    1mod3
    2mod3
  ),
  :initial => 'start',
  :final => %w(
    zero
    0mod3
  ),
  :transitions => {
    'start' => [
      ['0','zero'],
      ['1','1mod3']
    ],
    '1mod3' => [
      ['0','2mod3'],
      ['1','0mod3']
    ],
    '2mod3' => [
      ['0','1mod3'],
      ['1','2mod3']
    ],
    '0mod3' => [
      ['0','0mod3'],
      ['1','1mod3']
    ]
  }
}
```

For those of you not familiar with ruby, `%w(one two three)` is equivalent to `['one','two','three']`. Just a bit of syntactic sugar.

You can generate the DFA format required by Marmoset with the following function:

```ruby
def dfa_output(dfa)
  lines = []
  lines << dfa[:alphabet].length.to_s
  dfa[:alphabet].each {|c| lines << c.to_s}

  lines << dfa[:states].length.to_s
  dfa[:states].each {|s| lines << s.to_s}

  lines << dfa[:initial].to_s

  lines << dfa[:final].length.to_s
  dfa[:final].each {|f| lines << f.to_s}

  transitions = []
  dfa[:transitions].each do |start,pair_array|
    pair_array.each do |(sym,targ)| 
      if sym.is_a? String 
        transitions << "#{start} #{sym} #{targ}"
      else
        sym.each do |s|
          transitions << "#{start} #{s} #{targ}"
        end
      end
    end
  end

  lines << transitions.length.to_s
  lines += transitions

  return lines.join("\n")
end
```


And then invoking with

```ruby
puts dfa_output(dfa)
```

I designed the function with ranges and multiple transition tokens in mind, so you can do stuff like this:

```ruby
'start_state' => [
  [%w(one that other),'end_state'],
  [1..9,'X']
]
```

Now, this makes fixing problems, once discovered, much much simpler than trying to locate the error in the DFA format, but it still doesn't help much by way of identifying problems in the DFA itself. Probably the easiest way to look at a DFA is as a picture. Thankfully, there exists a set of tools perfect for this task known as [Graphviz][].

Graphviz DOT
========
![Sample Graph](http://imgur.com/FBFpb.png)

Graphviz is a collection of utilities used for visualizing graphs. The tool of interest for this post is DOT.
It produces the kind of thing you can see above - which is the same graph described by the ruby code and the DFA format above.

The syntax of DOT is very simple, and is better explained by [the DOT language wiki entry][dotwiki] than by the official documentation.
The DOT description of the above graph is as follows:

    digraph dfa {
      "" [shape=none]
      "start" [shape=circle]
      "zero" [shape=doublecircle]
      "0mod3" [shape=doublecircle]
      "1mod3" [shape=circle]
      "2mod3" [shape=circle]

      "" -> "start"
      "1mod3" -> "2mod3" [label="0"]
      "1mod3" -> "0mod3" [label="1"]
      "0mod3" -> "0mod3" [label="0"]
      "0mod3" -> "1mod3" [label="1"]
      "2mod3" -> "1mod3" [label="0"]
      "2mod3" -> "2mod3" [label="1"]
      "start" -> "zero" [label="0"]
      "start" -> "1mod3" [label="1"]
    }

And this is the ruby code to generate that output using the `dfa = { ... }` format at the beginning of the post.

```ruby
def dot_output(dfa)
  lines = []
  lines << "digraph dfa {"

  lines << %(\t"" [shape=none])

  dfa[:states].each do |state|
    if (dfa[:final].include? state)
      lines << %(\t"#{state}" [shape=doublecircle])
    else
      lines << %(\t"#{state}" [shape=circle])
    end
  end

  lines << ''
  lines << %(\t"" -> "#{dfa[:initial]}")

  dfa[:transitions].each do |start,pair_array|
    pair_array.each do |(sym,targ)| 
      if sym.is_a? String
        lines << %(\t"#{start}" -> "#{targ}" [label="#{sym}"])
      else
        lines << %(\t"#{start}" -> "#{targ}" [label="[#{sym.collect(&:to_s).join(',')}]"])
      end
    end
  end

  lines << "}"

  return lines.join("\n")
end

```
Once you've installed Graphviz, you can generate a PNG of the graph by running 

```bash
dot -Tpng < graph.dot > graph.png
```

Enjoy CS241 A5.

[dotwiki]: http://en.wikipedia.org/wiki/DOT_language
[Graphviz]: http://www.graphviz.org/
[format]: http://www.student.cs.uwaterloo.ca/~cs241/dfa/DFAfileformat.html
