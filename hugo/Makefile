.PHONY: install clean require_pygments build server deploy_without_building deploy

server: require_pygments
	hugo server

install:
	pip install pygments
	go get github.com/jlfwong/hugo

clean:
	rm -rf public

require_pygments:
	@which pygmentize > /dev/null || \
		(echo "pygmentize script not found. Run:\n\n\tsudo pip install pygments\n" \
		&& false)

build: require_pygments
	hugo

deploy_without_building:
	rsync -rtzh --progress --delete public/ ubuntu@jamie-wong.com:/var/www/jamie-wong.com/blog/

deploy: build deploy_without_building
