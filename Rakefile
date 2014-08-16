task :default => :fastserver

desc 'Clean up generated site'
task :clean do
  cleanup
end

desc 'Build site with Jekyll'
task :build => :clean do
  compass
  sh 'jekyll build'
end

desc 'Start server with --auto'
task :fastserver => :clean do
  compass
  sh 'DISABLE_SYNTAX_HIGHLIGHTING=1 jekyll serve -w'
end

task :server => :clean do
  compass
  sh 'jekyll serve -w'
end

desc 'Deploy'
task :deploy => :build do
  sh 'rsync -rtzh --progress --delete _site/ ec2:/var/www/jamie-wong.com/blog/'
end

desc 'Check links for site already running on localhost:4000'
task :check_links do
  begin
    require 'anemone'
    root = 'http://localhost:4000/'
    Anemone.crawl(root, :discard_page_bodies => true) do |anemone|
      anemone.after_crawl do |pagestore|
        broken_links = Hash.new { |h, k| h[k] = [] }
        pagestore.each_value do |page|
          if page.code != 200
            referrers = pagestore.pages_linking_to(page.url)
            referrers.each do |referrer|
              broken_links[referrer] << page
            end
          end
        end
        broken_links.each do |referrer, pages|
          puts "#{referrer.url} contains the following broken links:"
          pages.each do |page|
            puts "  HTTP #{page.code} #{page.url}"
          end
        end
      end
    end

  rescue LoadError
    abort 'Install anemone gem: gem install anemone'
  end
end

desc 'Watch and recompile sass'
task :compass do
  sh 'compass watch -c config.rb --force'
end

def cleanup
  sh 'rm -rf _site'
end

def compass(opts = '')
  sh 'compass compile -c config.rb --force ' + opts
end
