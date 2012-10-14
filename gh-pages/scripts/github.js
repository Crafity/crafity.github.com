$(function () {

	var template = $(".repository.template").clone().removeClass('template hidden').get(0).outerHTML
		, html$ = $("body")
		, section = $("section .repositories")
		, loadingMessage = section.find('.loading.message')
		, loadingCount = 0
		, markdown = new Showdown.converter();
	$(".repository.template").detach();
	
	getUserInfo(Gh3, "Crafity");
	section.delegate("a.show.readme", "click", function () {
		$(this).next(".content").toggleClass("hidden");
		return false;
	});
	
	function getUserInfo(Gh3, username) {
		html$.addClass("loading");
		var user = new Gh3.User(username);
		user.fetch(function (err, crafityUser) {
			getRepositories(Gh3, crafityUser);
		});
	}

	function getRepositories(Gh3, user) {
		var repositories = new Gh3.Repositories(user);
		repositories.fetch({page: 1, per_page: 500, direction: "asc"}, {}, function (err, results) {
			results.repositories.forEach(function (repo) {
				if (~repo.name.indexOf('crafity-')) {
					loadingCount++;
					var repo = new Gh3.Repository(repo.name, user);
					repo.fetch(function () {
						getBranches(repo);
					});
				}
			});
		});
	}

	function getBranches(repo) {
		repo.fetchBranches(function () {
			getContents(repo, repo.getBranchByName("master"));
		});
	}

	function getContents(repo, branch) {
		branch.fetchContents(function () {
			var hasReadme = false;
			branch.eachContent(function (content) {
				if (!hasReadme && (hasReadme |= content.name.toLowerCase() === "readme.md")) {
					content.fetchContent(function () {
						renderRepository(repo, content.getRawContent())
					});
				}
			});
			if (!hasReadme) { renderRepository(repo, ""); }
		});
	}

	function renderRepository(repo, readme) {
		// ["name", "user", "watchers_count", "has_issues", "has_wiki", "forks_count", "html_url", "owner", "updated_at", "open_issues_count", "full_name", "network_count", "pushed_at", "forks", "open_issues", "homepage", "language", "master_branch", "mirror_url", "clone_url", "organization", "ssh_url", "svn_url", "size", "fork", "description", "watchers", "created_at", "has_downloads", "_links", "url", "git_url", "private", "id"]
		loadingCount--;

		if (loadingCount === 0) {
			html$.removeClass("loading");
		}
		if (loadingMessage) {
			loadingMessage.remove();
			loadingMessage = undefined;
		}
		var lastUpdated = new Date(repo.updated_at);
		lastUpdated = "" + lastUpdated.getDate() + "-" + (lastUpdated.getMonth() + 1) + "-" + lastUpdated.getFullYear();
		var instance = template
			.replace(/{{name}}/gmi, repo.name)
			.replace(/{{description}}/gmi, repo.description)
			.replace(/{{watchers_count}}/gmi, repo.watchers_count)
			.replace(/{{open_issues_count}}/gmi, repo.open_issues_count)
			.replace(/{{size}}/gmi, repo.size)
			.replace(/{{show_fork}}/gmi, repo.fork ? "" : "display:none")
			.replace(/{{updated_at}}/gmi, lastUpdated)
			.replace(/{{readme}}/gmi, markdown.makeHtml(readme))
			.replace(/readme hidden/gmi, "readme " + (readme ? "" : "hidden"));
//		console.log("repo.open_issues", repo.open_issues);
		$("section .repositories").children().each(function () {
			var this$ = $(this);
//			console.log(this$.find(".size").text());
			var size = parseInt(this$.find(".size").text(), 10);
			if (!instance || parseInt(repo.size, 10) < size) {
//				console.log(parseInt(repo.size, 10), size);
			} else {
				$(instance).insertBefore(this$);
				instance = undefined;
			}
		});
		instance && section.append(instance);
	}
});
	
