"use strict";define("discovery/models",["backbone","moment","core/time"],function(a,b,c){var d=function(a){var d=a.prototype;return a.extend({defaults:{sourceThreadId:null,forumId:null,forum:null,threadForum:null,requestBin:null,createdAgo:!1},initialize:function(a,d){if(this.set("threadForum",a.forum),d&&d.humanFriendlyTimestamp){var e=c.assureTzOffset(this.get("createdAt"));e=b(e,c.ISO_8601),this.set("createdAgo",e.fromNow())}},toJSON:function(){var a=d.toJSON.call(this);return a.preview&&(a.preview=a.preview.toJSON()),a},toString:function(){return"organic link: "+this.get("title")+" "+this.get("link")+" (id = "+this.id+")"}})}(a.Model);return{RelatedThread:d}}),define("discovery/collections",["underscore","backbone","loglevel","core/api","core/utils/html","discovery/models"],function(a,b,c,d,e,f){var g=b.Collection.extend({url:d.getURL("discovery/listTopPost.json"),parse:function(a){for(var c=b.Collection.prototype.parse.call(this,a),d=0,f=c.length;d<f;d++)c[d].plaintext=e.stripTags(c[d].message);return c}}),h=b.Collection.extend({url:d.getURL("discovery/listRelated.json"),initialize:function(a,b){this.model=f.RelatedThread,this.name=b.name,this.minLength=b.minLength,this.maxLength=b.maxLength,this.homeDiscoveryEnabled=b.homeDiscoveryEnabled,this.previews=new g},addClickMetadata:function(a){this.invoke("set",a)},fetch:function(a,d){a.data.limit=2*this.maxLength,a.data.homeDiscoveryEnabled=this.homeDiscoveryEnabled&&"1";var e=Promise.resolve(b.Collection.prototype.fetch.call(this,a)),f=this;return d&&(e=e.then(function(){return f.getContentPreviews()["catch"](function(a){c.info("There was a problem getting snippets: ",a)})})),e},getContentPreviews:function(){var b=this.map(function(a){return parseInt(a.get("id"),10)});if(b.length<this.minLength)return Promise.resolve();b.sort(function(a,b){return a-b});var c=Promise.resolve(this.previews.fetch({data:{thread:b},timeout:h.CONTENT_PREVIEWS_FETCH_TIMEOUT}));return c.then(a.bind(this.attachPreviews,this))},attachPreviews:function(){this.previews.each(function(a){var b=a.get("thread"),c=this.get(b);c&&c.set("preview",a)},this)}},{CONTENT_PREVIEWS_FETCH_TIMEOUT:5e3}),i={PostCollection:g,RelatedThreadCollection:h};return i}),define("discovery/exceptions",[],function(){var a=function(a,b){var c=function(){var c=Error.apply(this,arguments);return c.name=this.name=a,this.disqusCode=b||"uncaught",this.message=c.message,this.stack=c.stack,this},d=function(){};return d.prototype=Error.prototype,c.prototype=new d,c};return{NoAds:a("NoAds","no_ads"),NoBinError:a("NoBinError","no_bin"),AdsExhaustedError:a("AdsExhaustedError","ads_exhausted"),RenderError:a("RenderError","render_error"),FetchError:a("FetchError","fetch_error"),TimeoutError:a("TimeoutError","timeout"),ValidationError:a("ValidationError","validation_error"),AdBlockError:a("AdBlockError","ad_block")}}),define("discovery/helpers",["underscore","jquery","loglevel"],function(a,b,c){var d=function(d,e){function f(){return j.scrollHeight-j.offsetHeight>.2*k}function g(){i.lastChild&&!a.contains(["...","…"],i.lastChild.nodeValue)&&(l=i.appendChild(window.document.createTextNode(" "+o)),f()&&(i.removeChild(l),i.removeChild(i.lastChild),g()))}if(!d.closest("body").length)return void c.info("lineTruncate called on el not on DOM");if(d.text().length<1)return void c.info("lineTruncated called on empty el");var h=function(a){return 3!==a.nodeType};if(a.any(d.children(),h))return void c.info("lineTruncate called on non-flat el");var i=d[0],j=i;if("block"!==d.css("display"))for(;j.parentNode&&(j=j.parentNode,"block"!==b(j).css("display")););var k=parseFloat(d.css("font-size"),10);if(f()){e=e||{};var l,m,n=e.lines||1,o=e.ellipsis,p=d.text();if(p.length){var q=d.width()/k,r=parseInt(q*n,10),s=p.split(/\s/),t=0;d.empty();var u=s.length;for(m=0;m<u&&(t+=s[m].length+1,!(t>=r));m++)i.appendChild(window.document.createTextNode(" "+s[m]));if(f())for(;i.lastChild&&f();)l=i.removeChild(i.lastChild);else{do l=i.appendChild(window.document.createTextNode(" "+s[m])),m+=1;while(!f()&&m<u);i.removeChild(l)}o&&(a.isString(o)||(o="…"),g())}}},e=function(b){function c(a,b){return a+b}var d,e,f,g,h,i=a.keys(b),j=Math.floor(a.reduce(b,c,0)/2),k=i.length+1,l=j+1,m=new Array(k);for(d=0;d<k;d++)m[d]=new Array(l),m[d][0]={};for(e=1;e<l;e++)m[0][e]=!1;var n={};for(e=1;e<l;e++)for(d=1;d<k;d++)f=i[d-1],g=b[f],h=a.clone(m[d-1][e]),!h&&g<=e&&(h=a.clone(m[d-1][e-g]),h&&(h[f]=g,n=h)),m[d][e]=h;return[n,a.omit(b,a.keys(n))]},f=["product","zone","service","experiment","variant"],g=function(b){b=b||"";var c=a.object(f,b.split(":"));return{bin:b,experiment:c.experiment||"",variant:c.variant||""}};return{lineTruncate:d,balancedPartition:e,binToEventParams:g}}),define("discovery/views/links/TwoColumn",["jquery","underscore","discovery/helpers"],function(a,b,c){var d=function(b,c){this.modelIds=b||[],this.$elements=a(c||[])};b.extend(d.prototype,{height:function(){var c=this;c.heights=[];var d=a(c.$elements),e=d.first().offset().top,f=function(){var a=d.last();return a.offset().top+a.height()}(),g=f-e,h=0;return b.each(d,function(b){var d=a(b).height();c.heights.push(d),h+=d}),this.interstice=(g-h)/(d.length-1),g}});var e=function(){this.divideIntoColumns=function(){var a=this,b=a.subviews[0];a.left=new d,a.right=new d;var c=0;b.collection.each(function(d,e){var f=c%2===0?"left":"right";c+=1,a[f].modelIds.push(d.id),Array.prototype.push.call(a[f].$elements,b.$elements[e])})},this.removeOneFromColumn=function(a,c){var d,e=b.chain(a.modelIds).map(function(b,c){return[b,a.heights[c]]}).sortBy(function(a){return-1*a[1]}).find(function(a){return a[1]<=c}).value()[0],f=this.subviews[0].collection,g=f.models,h=f.get(e),i=g.indexOf(h),j=[],k=[],l=[k,j],m=g.length;for(d=0;d<m;d++)l[d%2].push(g[d]);var n=l[i%2];n.splice(b.indexOf(n,h),1),g=[];var o=(i+1)%2;for(d=0;d<m-1;d++)g.push(l[(d+o)%2].shift());f.reset(g)},this.balanceColumns=function(){var a=this.subviews[0],d=a.collection,e={};d.each(function(b,c){e[c]=a.$elements.eq(c).height()});var f=c.balancedPartition(e);f=b.sortBy(f,"length");var g=f[1],h=f[0],i=d.models,j=new Array(i.length);b.each(g,function(a,b){j[2*b]=i[b]}),b.each(h,function(a,b){j[2*b+1]=i[b]}),d.reset(i)},this.shortenColumn=function(a,b){var c=this.subviews[0].collection;c.length%2!==0&&a===this.left?this.removeOneFromColumn(a,this.fudge*b):this.balanceColumns()}},f=function(){this.divideIntoColumns=function(){var a=this,b=a.subviews,c=b[0],e=b[1],f=c.collection.model.prototype.idAttribute;a.left=new d(c.collection.pluck(f),c.$elements);var g=e.collection.model.prototype.idAttribute;a.right=new d(e.collection.pluck(g),e.$elements)},this.shortenColumn=function(a,c){for(var d=a===this.left?this.subviews[0]:this.subviews[1],e=a===this.left?this.right:this.left,f=c/e.$elements.length,g=d.collection,h=b.chain(a.modelIds).map(function(b,c){return[b,a.heights[c]]}).sortBy(function(a){return a[1]}).value(),i=[],j=0,k=c,l=f;h.length;){var m=h.pop(),n=m[0],o=m[1],p=o+a.interstice;if(j+p>c&&(e=a),k=Math.abs(c-(j+p)),l=k/e.$elements.length,!(l>=f)){f=l;var q=a.modelIds.indexOf(n);a.modelIds.splice(q,1),Array.prototype.splice.call(a.$elements,q,1),j+=p,i.push(n)}}g.remove(i)}},g=function(a){this.fudge=a.fudge,this.subviews=a.views.slice(0,2),1===this.subviews.length?e.call(this):f.call(this)};return b.extend(g.prototype,{ascendingByHeight:function(){var a=this.left,c=this.right,d=[[a,a.height()],[c,c.height()]];return b.sortBy(d,function(a){return a[1]})},evenColumns:function(a){var c=this.ascendingByHeight(),d=c[0][0],e=c[0][1],f=c[1][0],g=c[1][1];if(e!==g){var h=g-e,i=this.fudge*h,j=b.find(f.heights,function(a){return a+f.interstice<i});return!a&&j?(this.shortenColumn(f,h),this.divideIntoColumns(),this.evenColumns("do not recurse again")):void this.increaseMargins(d,h)}},increaseMargins:function(c,d){var e=c.$elements.length;if(!(e<2)){var f=d/e;b.each(c.$elements,function(b){var c=a(b),d=parseInt(c.css("margin-bottom"),10),e=d+f;c.css("margin-bottom",e+"px")})}},render:function(){return this.divideIntoColumns(),this.evenColumns(),this}}),g}),define("templates/discovery/discoveryCollection",["underscore","react","core/strings","core/utils/object/get"],function(a,b,c,d){var e=c.gettext,f=function(a){return b.createElement("a",{className:"top-comment","data-role":"discovery-top-comment",href:a.discoveryLink,target:a.brand?"_blank":"",rel:a.brand?"nofollow norewrite":""},b.createElement("img",{"data-src":d(a.preview,["author","avatar","cache"],""),alt:e("Avatar"),"data-role":"discovery-avatar"}),b.createElement("p",null,b.createElement("span",{className:"user","data-role":"discovery-top-comment-author"},d(a.preview,["author","name"],null))," ","—"," ",b.createElement("span",{"data-role":"discovery-top-comment-snippet",className:"line-truncate","data-line-truncate":"3",dangerouslySetInnerHTML:{__html:d(a.preview,["message"],null)}})))},g=function(c){return a.map(c.collection,function(a,g){return b.createElement("li",{className:"discovery-post post-"+g,id:"discovery-link-"+a.domIdSuffix},b.createElement("a",{className:"publisher-anchor-color",href:a.discoveryLink,target:a.brand?"_blank":"",rel:a.brand?"nofollow norewrite":""},b.createElement("header",{className:"discovery-post-header"},b.createElement("h3",{title:a.title},b.createElement("span",{"data-role":"discovery-thread-title",className:"title line-truncate","data-line-truncate":d(c.variant,["numLinesHeadline"],""),dangerouslySetInnerHTML:{__html:a.title}})),b.createElement("ul",{className:"meta"},a.posts>0?b.createElement("li",{className:"comments"},1===a.posts?e("1 comment"):e("%(numPosts)s comments",{numPosts:a.posts})," "):null," ",c.variant.homeDiscoveryEnabled?b.createElement("li",null,a.threadForum.name):b.createElement("li",{className:"time"},a.createdAgo))),d(c.variant,["contentPreviews"],null)&&a.preview?b.createElement(f,a):null))})};return g}),define("discovery/views/links/BaseCollectionView",["underscore","jquery","backbone","react","react-dom","common/urls","discovery/helpers","templates/discovery/discoveryCollection"],function(a,b,c,d,e,f,g,h){var i=c.View.extend({events:{"click [data-redirect]":"handleClick"},handleClick:function(a){this.swapHref(a.currentTarget)},swapHref:function(b){b.setAttribute("data-href",b.getAttribute("href")),b.setAttribute("href",b.getAttribute("data-redirect")),a.delay(function(){b.setAttribute("href",b.getAttribute("data-href"))},100)},initialize:function(a){this.elementsSelector="li.discovery-post",this.$elements=this.$el.find(this.elementsSelector),this.initContext=a.context;var b=this.collection;this.listenTo(b,{remove:this.remove,reset:this.render})},truncate:function(){var c=this.$el.find(".line-truncate");a.each(c,function(a){var c=b(a);g.lineTruncate(c,{lines:parseInt(c.attr("data-line-truncate"),10),ellipsis:!0})})},getTemplateContext:function(){this.appContext||(this.appContext=this.model.app.toJSON());var b=a.extend({variant:this.appContext},this.initContext);b.collection=this.collection.toJSON();var c=this.collection.at(0);if(c){var d=c.has("id")?"organic-":"promoted-",e=c.idAttribute,g=this.model.app.get("homeDiscoveryEnabled");a.each(b.collection,function(a){a.advertisement_id=a[e],a.domIdSuffix=a[e],a.domIdSuffix=d+a.domIdSuffix,a.discoveryLink=g?f.home+"discussion/"+a.threadForum.id+"/"+a.slug:a.signedLink})}return b},render:function(){var a=this.getTemplateContext();return this.el.children.length||e.render(d.createElement(h,a),this.el),this.$elements=this.$el.find(this.elementsSelector),this.truncate(),this},remove:function(d,e,f){if(0===arguments.length)return c.View.prototype.remove.call(this);var g=a.toArray(this.$elements),h=g.splice(f.index,1)[0];return b(h).remove(),this.$elements=b(g),this}});return i}),define("templates/discovery/discoveryMain",["underscore","react","core/strings","core/utils/object/get"],function(a,b,c,d){var e=c.gettext,f=function(c){return b.createElement("div",{id:c.id,className:"discovery-main"},a.map(c.sections,function(a){return b.createElement("section",{id:a.id,className:a.className},b.createElement("header",{className:"discovery-col-header"},b.createElement("h2",null,e("Also on %(forumName)s",{forumName:b.createElement("strong",null,c.homeDiscoveryEnabled?"Disqus":d(c.forum,["name"],null))}))),b.createElement("ul",{className:"discovery-posts","data-role":"discovery-posts"}))}))};return f}),define("discovery/views/links/MainView",["jquery","underscore","backbone","discovery/views/links/TwoColumn","discovery/views/links/BaseCollectionView","templates/discovery/discoveryMain"],function(a,b,c,d,e,f){var g=440,h=c.View.extend({topEdgeOffset:0,bottomEdgeOffset:1/0,initialize:function(){this.$el.css({display:"block",width:"100%"})},createSections:function(){var a=this.model,c=a.get("sectionNames"),d=a.get("sectionIds");return b.map(a.collections,function(a,b){return{id:d[b],className:c[b],collection:a}})},getTemplateContext:function(){var a=this.model.app,b=this.createSections();return{id:a.get("innerContainerId"),sections:b,forum:a.get("sourceForum"),homeDiscoveryEnabled:a.get("homeDiscoveryEnabled")}},render:function(){var c=this;return c.model.validateData(),c.renderViews(),c.resizeHandler=b.debounce(function(){c.views&&b.invoke(c.views,"render")},100),a(window).on("resize",c.resizeHandler),this},renderViews:function(){var c=this.getTemplateContext(),d=this;this.$el.html(f(c));var g=!d.isTwoColumnLayout(),h=1===d.model.collections.length;(g||h)&&d.model.trimOrganic();var i=b.map(c.sections,function(b){return new e({model:d.model,collection:b.collection,el:a("#"+b.id+"> [data-role=discovery-posts]"),context:{}})}),j=this.$el.width();this.$el.width(j-20),b.invoke(i,"render"),this.$el.width("100%"),this.views=i,this.evenColumns()},remove:function(){c.View.prototype.remove.call(this),this.resizeHandler&&a(window).off("resize",this.resizeHandler)},getWidth:function(){return this.$el.width()},isTwoColumnLayout:function(){return this.getWidth()>=g},evenColumns:function(){if(this.isTwoColumnLayout()){var a=new d({views:this.views,fudge:1.2});a.render()}}});return h}),define("discovery/views/Placement",["backbone","discovery/exceptions","discovery/views/links/MainView"],function(a,b,c){var d=a.View.extend({className:"post-list",LAYOUT_TO_CLASS:{links:c},initialize:function(a){a=a||{},this.placement=a.placement,this.sourceThreadUrl=a.sourceThreadUrl,this._enabled=!0,this._collapse()},setRequestBin:function(a){this._bin=a},tryAd:function(a){this._unsetAd();var c=a.get("layout"),d=this.LAYOUT_TO_CLASS[c];return d?(a.state.set("placement",this.placement),this._adView=new d({model:a,sourceThreadUrl:this.sourceThreadUrl}),this.$el.html(this._adView.el),this._adView.render(),void this._expand()):Promise.reject(new b.ValidationError('Specified ad layout "'+c+'" was not found.'))},getCurrentUnit:function(){return this._adView},disable:function(){this._enabled=!1,this._collapse()},enable:function(){this._enabled=!0,this._expand()},remove:function(){return this._unsetAd(),a.View.prototype.remove.apply(this,arguments)},_unsetAd:function(){this._adView&&(this._adView.model.state.unset("placement"),this._adView.remove(),this._adView=null)},_expand:function(){this._enabled&&this.$el.css({height:"auto",visibility:"visible"})},_collapse:function(){this.$el.css({height:0,visibility:"hidden"})}});return d}),define("discovery/models/State",["backbone"],function(a){var b={UNTOUCHED:1,PROCESSING:2,DONE:4};return a.Model.extend({defaults:{status:b.UNTOUCHED,placement:null,error:null},isResolved:function(){return this.isDone()&&!this.get("error")},isRejected:function(){return this.isDone()&&this.get("error")},isDone:function(){return this.get("status")===b.DONE}},{STATUS:b})}),define("discovery/models/SponsoredLinkAd",["underscore","backbone","core/analytics/jester","common/Session","discovery/helpers","discovery/exceptions","discovery/models/State"],function(a,b,c,d,e,f,g){return b.Model.extend({idAttribute:"layout",initialize:function(b,c){var d=this;d.threads=c.threads,d.collections=[],d.app=c.app,a.bindAll(d,"validateCollectionMin","prepareData"),d.set("sectionNames",["col-organic"]),d.set("sectionIds",a.map(d.get("sectionNames"),function(a){return a+"-"+d.cid})),d.collections.push(this.threads),this.state=new g,d.threads&&d.threads.each(function(a){a.state=d.state})},hasData:function(){return a.some(this.collections,function(a){return a.length})},validateCollectionMin:function(){for(var b,c,d=this.collections,e=this.get("sectionNames").slice(0),f=this.get("sectionIds").slice(0),g=d.length;g>0;)g-=1,b=d[g],c=b.minLength,b.length<c&&(d.splice(g,1),e.splice(g,1),f.splice(g,1),g=d.length);if(a.isNumber(this.app.get("numColumns"))&&a.isNumber(this.app.get("minPerColumn"))){var h=this.app.get("numColumns")*this.app.get("minPerColumn"),i=a.reduce(d,function(a,b){return a+b.length},0);i<h&&(d.splice(0,d.length),e.splice(0,e.length),f.splice(0,f.length))}this.set("sectionNames",e),this.set("sectionIds",f)},prepareData:function(){var a=this.commonClickMetadata();this.threads.addClickMetadata(a)},trimOrganic:function(){var a=this.threads;a.length>a.maxLength&&a.reset(a.slice(0,a.maxLength))},validateData:function(){var a=this;if(a.threads.maxLength=a.app.getCollectionMax("Organic"),this.validateCollectionMin(),this.prepareData(),!a.hasData())throw new f.ValidationError("Not enough data")},commonClickMetadata:function(){var a=this.app,b=a.get("sourceForum"),c={sourceThreadId:a.get("sourceThread").id,forumId:b.pk,forum:b.id,requestBin:a.get("requestBin")};return d.isKnownToBeLoggedOut()||(c.userId=d.fromCookie().id),c},report:function(b){a.isEmpty(b)||c.client.emit(a.extend(this.snapshot(),b))},snapshot:function(){var b=this.threads,c=this.app,f=e.binToEventParams(c.get("requestBin")),g=d.isKnownToBeLoggedOut()?{}:{userId:d.fromCookie().id},h=a.extend({internal_organic:b&&b.length,external_organic:0,promoted:0,display:!0,placement:this.state.get("placement"),zone:"thread",area:this.state.get("placement"),thread_id:c.get("sourceThread").id,forum_id:c.get("sourceForum").pk},g,f,{object_type:"link"});return h}})}),define("discovery/main",["backbone","underscore","jquery","loglevel","common/Session","discovery/collections","discovery/views/Placement","discovery/models/SponsoredLinkAd"],function(a,b,c,d,e,f,g,h){var i={},j=1e4;return i.DiscoveryApp=a.Model.extend({defaults:{name:"default",contentPreviews:!0,sourceThread:null,sourceForum:null,sourceThreadUrl:null,numColumns:2,maxPerColumn:2,maxOrganicTextLinks:4,innerContainerName:"discovery-main",lineTruncationEnabled:!0,numLinesHeadline:2,homeDiscoveryEnabled:void 0},initialize:function(){var a=this;a.session=e.get(),a.bottomPlacement=new g({placement:"bottom"}),c("#placement-bottom").html(a.bottomPlacement.$el),a.set("innerContainerId",a.get("innerContainerName")+"-"+a.cid),a.createDataCollections()},createDataCollections:function(){var a="Organic";this.threads=new f.RelatedThreadCollection([],{name:a,minLength:2,maxLength:this.getCollectionMax(a),homeDiscoveryEnabled:this.get("homeDiscoveryEnabled")})},getViewportWidth:function(){return c(window.document).width()},getCollectionMax:function(a){return this.get("max"+a+"TextLinks")},run:function(){var a=this;return a.getDataOrganic().then(function(){return a.threads.length?a.renderOrganicLinks():void d.debug("No organic links, bailing out")})["catch"](function(a){d.debug("Organic-only Discovery failed",a)})},renderOrganicLinks:function(){var a=new h({layout:"links"},{threads:this.threads,app:this});this.bottomPlacement.tryAd(a)},getDataOrganic:function(){var a={timeout:j,data:{thread:this.get("sourceThread").id},reset:!0,humanFriendlyTimestamp:!0};return this.threads.fetch(a,this.get("contentPreviews"))}}),i.init=function(a,c){var d=b.extend({},{sourceThread:a.toJSON(),sourceForum:a.forum.toJSON(),sourceThreadUrl:a.currentUrl||window.document.referrer,service:c.service,experiment:c.experiment,variant:c.variant,homeDiscoveryEnabled:c.homeDiscoveryEnabled}),e=new i.DiscoveryApp(d);return e.run(),e},i}),define("discovery.bundle",function(){});