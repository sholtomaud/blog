require 'rdiscount'
require 'nokogiri'
require 'albino'

module Jekyll
  class MarkdownConverter < Converter
    safe true

    priority :high

    def matches(ext)
      ext =~ /md/i
    end

    def output_ext(ext)
      ".html"
    end

    def convert(content)
      rdiscount_extensions = @config['rdiscount']['extensions'].map { |e| e.to_sym }
      rd = RDiscount.new(content, *rdiscount_extensions)
      html = rd.to_html
      toc_token = @config['rdiscount']['toc_token']

      if html.include? "Table of Contents"
        puts "\n\n"
        puts "TOC TOKEN: #{toc_token}"
        puts "INCLUDED?: #{html.include?(toc_token)}"
        puts "HTML: #{html}"
      end

      if rd.generate_toc and html.include?(toc_token)
        toc_html = %(
          <section class="table-of-contents">
            #{rd.toc_content}
          </section>
        )
        html.gsub!(@config['rdiscount']['toc_token'], toc_html)
      end

      if ENV['DISABLE_SYNTAX_HIGHLIGHTING'] == '1'
        html
      else
        doc = Nokogiri::HTML(html)
        doc.css('pre > code').each do |code_node|
          code_content = code_node.children[0].content

          lines = code_content.lines.to_a.collect(&:rstrip)

          if lines[0].start_with? 'lang:'
            lang = lines[0].split(':')[1].to_sym
            code = lines[2..-1].join "\n"
            colorized_html = Albino.colorize(code, lang)
            if colorized_html.length > 0
              code_node.parent.replace(colorized_html)
            end
          end
        end

        doc.to_html
      end
    end
  end
end

