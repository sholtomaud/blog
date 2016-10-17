---
date: 2010-06-29T00:00:00Z
meta:
  _edit_last: "1"
  _edit_lock: "1287294635"
published: true
status: publish
tags:
- bash
- commandline
- shell
title: Commandline Tips and Tricks
type: post
url: /2010/06/29/commandline-tips-and-tricks/
---

Alas, I have been stricken with the plague of half-finished posts and projects. But, as I feel the need to have at least one post per month, here's some stuff you might find useful.

I forget where I discovered this, but <a 
href="http://www.commandlinefu.com/commands/browse/sort-by-votes">commandlinefu.com</a> 
is an awesome site.

It's so awesome in fact, that I think the productivity gains I've gotten from it <strong>almost</strong> outweigh the time I wasted looking through the site and testing it.

Here are some of the more useful ones from the site and a few I learned at work and elsewhere.

<h2>Change to previous working directory</h2>

From: <a href="http://www.commandlinefu.com/commands/view/51/change-to-the-previous-working-directory">Change to the previous working directory @ commandlinefu.com</a>
<style>pre.cmd {background-color:#444; color:#FFF; padding:10px; margin-bottom:5px;}</style>

```bash
$ pwd
/Users/jamiewong/code/stackoverflow

$ cd /usr/bin

$ pwd
/usr/bin

$ cd -
/Users/jamiewong/code/stackoverflow

$ pwd
/Users/jamiewong/code/stackoverflow
```

<h2>Rerun the last command</h2>

From: <a href="http://www.commandlinefu.com/commands/view/1189/run-the-previous-command-with-sudo">Run the previous command with sudo @ commandlinefu.com</a>

```bash
$ echo hello
hello

$ !!
echo hello
hello

$ ln -s some_script.sh /usr/bin/some_script
ln: /usr/bin/some_script: Permission denied

$ sudo !!
sudo ln -s some_script.sh /usr/bin/some_script

$ ls -l /usr/bin/some_script
lrwxr-xr-x  1 root  wheel  14 30 Jun 00:44 /usr/bin/some_script -> some_script.sh

$ cat /etc/apache2/passenger_pane_vhosts/searchgraph*
<VirtualHost *:80>
    ServerName searchgraph.local
    DocumentRoot "/Users/jamiewong/Code/searchgraph/public"
    RailsEnv development
    <Directory "/Users/jamiewong/Code/searchgraph/public">
    Order allow,deny
    Allow from all
    </Directory>
</VirtualHost>

$ echo "!!"
echo "cat /etc/apache2/passenger_pane_vhosts/searchgraph*";
cat /etc/apache2/passenger_pane_vhosts/searchgraph.local.vhost.conf
```

<h2>Modify the last command and run it</h2>

From: <a href="http://www.commandlinefu.com/commands/view/19/runs-previous-command-but-replacing">Runs the previous command but replacing @ commandlinefu.com</a>

```bash
$ echo hello world
hello world

$ ^world^friends
echo hello friends
hello friends

$ ls *.php
bolding.php shd.php     stream.php

$ ^php^rb
ls *.rb
hms.rb           split_orderby.rb

$ cds ..
-bash: cds: command not found

$ ^s
cd ..
```

<h2>List your last n commands</h2>

```bash
$ history 10
    522  locate mysqld
    523  sudo /Library/StartupItems/MySQLCOM/MySQLCOM start
    524  sudo /Library/PreferencePanes/MySQL.prefPane/Contents/MacOS/MySQL
    525  sudo mysqld_safe
    526  sudo /usr/local/mysql/bin/mysqld_safe
    527  mysql
    528  history
    529  history | awk '{a[$2]++}END{for(i in a){print a[i] " " i}}' | sort -rn | head
    530  history
    531  history 10
```

<h2>Edit and run a previous command</h2>

From: <a href="http://www.commandlinefu.com/commands/view/1561/edit-the-last-or-previous-command-line-in-an-editor-then-execute">Edit the last command line in an editor then execute @ commandlinefu.com</a>

This one requires a bit of explanation. The `fc` command will, by default, open 
your last command in the console editor you specify (emacs by default).  
If you want it to be vim, stick this in your `.bash_profile` to just run 
it when you want to use it. 

```bash
export EDITOR=vim
```

Then run `fc`, and it will open up your editor with your last command in it.
Save and exit (`:wq`) to run that command.
If you just want to execute it immediately, use `fc -s`.

```bash
$ history 5
    86  cat /etc/apache2/passenger_pane_vhosts/searchgraph.local.vhost.conf 
    87  echo "cat /etc/apache2/passenger_pane_vhosts/searchgraph.local.vhost.conf "
    88  history 10
    89  echo "cat /etc/apache2/passenger_pane_vhosts/searchgraph.local.vhost.conf "
    90  history 5

$ fc -s 87
echo "cat /etc/apache2/passenger_pane_vhosts/searchgraph.local.vhost.conf "
cat /etc/apache2/passenger_pane_vhosts/searchgraph.local.vhost.conf
```

If you don't care to look up the history number but happen to remember that it 
was the command you executed two lines ago, you can use negative history numbers

    $ echo hello
    hello

    $ echo world
    world

    $ fc -s -2
    echo hello
    hello

<h2>Follow new output to a log</h2>

This one comes from my coworkers

```bash
$ tail -f ~/code/searchgraph/log/development.log 


Processing HomeController#bp (for 127.0.0.1 at 2010-06-23 22:19:27) [GET]
Rendering home/bp
Completed in 6ms (View: 5, DB: 0) | 200 OK [http://searchgraph.local/bp]


Processing HomeController#bp (for 127.0.0.1 at 2010-06-23 22:20:46) [GET]
Rendering home/bp
Completed in 9ms (View: 7, DB: 0) | 200 OK [http://searchgraph.local/bp]
```
Then if I go open up searchgraph.local, my console window will get updated on 
its own

<h2>Copying and pasting from files</h2>

The pbcopy and pbpaste commands copy and paste from your clipboard.

```bash
$ echo test > test.txt

$ pbcopy < test.txt

$ pbpaste
test
```

And if you want to paste content you have in your clipboard to a file, just 
redirect, with

```bash
$ pbpaste > output.txt
```

That's all for now - I'll write more down as I find them.
