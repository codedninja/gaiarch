// All code belongs to Codedninja @ http://www.codedninja.com
// But htmlentities function. :p
// Background color #EEEEEF (later use)
var gaiarch={
	// Function to load settings before doing anything
	loadSettings:function()
	{
		chrome.extension.sendRequest({call: 'settings'}, function(response){
			settings = response.value;
			gaiarch.doneLoading();
		});
	},
	// Show (generate) the quick reply form
	quickreply:function(postid,replymode)
	{
		var curwindow = window;
		
		// Check current url for old links
		var regex=/^(https?:\/\/(?:[-_\w]+\.)*gaiaonline\.com\/(?:forum|guilds)\/)viewtopic\.php.*[?&]t=(\d+)/i;
		var res=regex.exec(curwindow.location.href);
		var newpostingmode=false;
		var privatemessage=false;

		// If nothing in the regex matches then do this
		if(res==null)
		{
			// Check current url for new links
			regex=/^(https?:\/\/(?:[-_\w]+\.)*gaiaonline\.com\/(?:forum|guilds)\/).*?\/t\.(\d+)/i;
			res=regex.exec(curwindow.location.href);
			if(res!=null)
			{
				newpostingmode=true;
			}
			else
			{
				// Check current url for private message page
				regex=/^(https?:\/\/(?:[-_\w]+\.)*gaiaonline\.com\/.*?\/)privmsg.*?[?&]id=([.\d]+)/i;
				res=regex.exec(curwindow.location.href);
				if(res!=null)
				{
					privatemessage=true;
				}
				else
				{
					alert('GaiArch could not determine the type of quick reply on this page.');
				}
			}
		}

		// If some of the regex has matched
		if(res!=null)
		{
			// Add a form to #gaiarchquickreplyform
			$('#gaiarchquickreplyform').html(
				$('<div></div>').attr({
					'align':'center',
					'id':'gaiarchquickreplyform'
				}).append(
					$('<form></form>').attr({
						'method':'post',
						'name':'compose'
					})
				)
			);
			
			// Store the form into a varible
			var form = $('#gaiarchquickreplyform form');
			
			// If this is a new post then add the action attribute
			if(newpostingmode)
			{
				if(replymode)
				{
					form.attr('action',res[1]+'compose/entry/new/'+res[2]+'/');
				}
				else
				{
					if(postid=='1')
					{
						form.attr('action',res[1]+'compose/topic/'+res[2]+'/');
					}
					else
					{
						form.attr('action',res[1]+'compose/entry/'+res[2]+'_'+postid+'/');
					}
				}
			}
			else
			{
				form.attr('action',res[1]+'posting.php');
			}
			
			// Add the <textarea> to the form
			form.append('<textarea id="textInputArea" id="message" name="message" class="gaiarchquickreplytext" tabindex="4"></textarea>');
			
			// Style the <textarea>
			var textareabox = $('#textInputArea');
			
			$(textareabox).css({
				width: "289px",
				height: "150px"
			});
			
			// Make URL for grabbing quoting text
			if(privatemessage)
			{
				postURL = curwindow.location.href.replace(/mode=read/i,'mode=reply');
			}
			else
			{
				if(newpostingmode)
				{
					if(replymode)
					{
						postURL = res[1]+'compose/entry/new/'+res[2]+(postid?'?quote='+postid:'');
					}
					else
					{
						postURL = res[1]+'compose/entry/'+res[2]+'_'+postid+'/';
					}
				}
				else
				{
					if(postid)
					{
						if(replymode)
						{
							replymode='quote';
						}
						else
						{
							replymode='edit';
						}
						postURL = res[1]+'posting.php?mode='+replymode+'&p='+postid;
					}
					else
					{
						postURL = res[1]+'posting.php?mode=reply&t='+res[2];
					}
				}
			}
			
			// Grab qouted data
			var postData = $.ajax({
				url: postURL,
				crossDomain:true,
			    async:false,
			    dataType:'html'
			}).responseText;
			
			
			try {
				// If showing loading image remove it
				if($('#gaiarchquickloading'))
				{
					$('#gaiarchquickloading').parent().remove();
				}
				
				// Regex to get data out of html. Can be rewriten to do with jQuery
				// Note: I was gonn rewrite this while doing comments but I stopped self cause I gave up on gaiaonline. lol
				var titleres=/<input[^<>]+type="text"[^<>]+name="title"[^<>]+value="([^"]+)"/i.exec(postData);
				var tagres=/<input[^<>]+type="text"[^<>]+name="tags"[^<>]+value="([^"]+)"/i.exec(postData);
				var moderes=/<input(?:\s+[-_\w]+="[-_\w]+")*\s+name="mode"(?:\s+[-_\w]+="[-_\w]+")*\s+value="([-_\w]+)"(?:\s+[-_\w]+="[-_\w]+")*\s*\/?>/i.exec(postData);
				var rhidden=/<input type="(?:hidden|text)" name="(?!title"|tags")([^"]+)".*?\svalue="([^"]*)"/i;
				var curpos=postData;
				var captcha = $(postData).find('div#captcha noscript');
				var hidden=rhidden.exec(curpos);
				var hiddens=new Array();
				var postcontent=/<textarea[^<>]*\sname=['"]?message['"]?[^<>]*>([^<]*)<\/textarea>/i.exec(postData);

				// If there is data to quote
				if(postcontent!=null)
				{
					var regex=/^(https?:\/\/(?:[-_\w]+\.)*gaiaonline\.com\/(?:forum|guilds)\/)viewtopic\.php\?(?:\w+=\w+&)*t=(\d+)(?:&\w+=\w+)*/i;
					var res=regex.exec(curwindow.location.href);
					textareabox.css({display:'block'});
					var d=gaiarchquickreplyform;
					var f=form;
					var i=0;
					var poststyle=!!$('#basicTypeSelector');
					var compound=!!$('#compound_type');
					var sig=0;
					var hiddenpost=0;
					var t,l;
					if(tagres!=null)
					{
						form.prepend(
							$('<label></label>').attr({
								'for':'tags'
							}).html('Tags: ').css({'display':'block'}).append(
								$('<input />').attr({
									'type':'text',
									'name':'tags',
									'id':'tags',
									'value':gaiarch.htmlentities(tagres[1])
								})
							)
						);
					}
					
					if(titleres!=null)
					{
						form.prepend(
							$('<label></label>').attr({
								'for':'title'
							}).html('Title: ').css({'display':'block'}).append(
								$('<input />').attr({
									'type':'text',
									'name':'title',
									'maxlength':60,
									'id':'title',
									'value':gaiarch.htmlentities(titleres[1])
								})
							)
						);
					}
					while(hidden!=null)
					{
						form.append(
							$('<input />').attr({
								'type':'hidden',
								'name':hidden[1]
							})
						);
							
						poststyle=poststyle+hidden[1]=='basic_type';
						compound=compound+hidden[1]=='compound_type';
						sig=sig+hidden[1]=='attach_sig';
						hiddenpost=hiddenpost+hidden[1]=='post';
						
						hidden[1] = hidden[1].replace(/\[/i,'').replace(/\]/i,'');
						
						if(hidden[1]=='post')
						{
							$('[name='+hidden[1]+']').attr({ 'value':'true' });
						}
						else
						{
							$('[name='+hidden[1]+']').attr({ 'value':hidden[2] });
						}
						
						curpos=curpos.substr(curpos.indexOf(hidden[0])+hidden[0].length);
						hidden=rhidden.exec(curpos);
					}
					if(!poststyle)
					{
						form.append(
							$('<input />').attr({
								'type':'hidden',
								'name':'basic_type',
								'id':'basicTypeSelector',
								'value':'0'
							})
						);
					}
					
					if(!compound)
					{
						form.append(
							$('<input />').attr({
								'type':'hidden',
								'name':'compound_type',
								'value':'0',
								'id':'counpound_type'
							})
						);
					}
					
					if(!sig)
					{
						form.append(
							$('<input />').attr({
								'type':'hidden',
								'name':'attach_sig',
								'id':'gaiarch_quickreply_attach_sig',
								'value':'on'
							})
						);
					}
					
					
					if(!hiddenpost)
					{
						form.append(
							$('<input />').attr({
								'type':'hidden',
								'name':'post',
								'id':'gaiarch_quickreply_post'
							})
						);
					}
					
					
					form.append(
						$('<input />').attr({
							'type':'hidden',
							'name':'action_submit',
							'value':'submit'
						})
					);
					
					$('#gaiarch_quickreply_post').attr({'value':'true'});
					
					if(captcha[0]!=null)
					{
						form.append('<div id="gaiarch_solvemedia"></div>');
						location.href = "javascript:ACPuzzle.create('eH7EyMOg0sbDFd-J9L6MuHpz4AafI4.V', 'gaiarch_solvemedia', {});";
					}
					
					form.append(
						$('<button></button>').attr({
							'type':'image',
							'title':'Submit',
							'class':'cta-button-sm'
						}).append(
							$('<span></span>').append('Submit')
						).css({
							cssFloat: "right",
							marginTop: "7px"
						})
					);
					
					var textval=gaiarch.htmlentities(postcontent[1]);
					
					if(textval)
					{
						textareabox.val(textval);
					}
					
					textareabox.focus();	// Refocus if needed.
				}
				else
				{
					gaiarchquickreplyform.attr({'style':'color:red'});
					gaiarchquickreplyform.html('Cannot reply on this topic.');
				}
			}
			catch(e)
			{
			    alert(e);
			}
			textareabox.focus();
		}
		else
		{
			alert('Couldn\'t get thread id');
		}
	},
	// Function to add buttons for "Quick Edit" and "Quick Quote"
	buildquickreply:function(tehwin,step)
	{
		var content = $('#content');
		
		var post_container = $('#post_container');
		
		if(content)
		{
			try {
				// Make A
				var gaiarchquickreplyform = $('#gaiarchquickreplyform');
				
				if(gaiarchquickreplyform)
				{
					threadid=/^(https?:\/\/(?:[-_\w]+\.)*gaiaonline\.com\/(?:forum|guilds)\/).*?\/t.(\d+)/i.exec(tehwin.location.href);
					
					if(threadid!=null)
					{
						// Find all quote links and add a quick quote button
						$('.post-quote').each(function(x) {
							var self = $(this);
							postid = self.attr('href');
							postid = postid.replace(/^.*=/i,'');
							if(settings.forumQuickQuote=='true')
							{
								self.parent().before(
									$('<li></li>').prepend(
										$('<a href="'+postid+'" class="cta-button-sm" id="gaiarchquickquote"><span>Quick Quote</span></a>').click(function(e){
											e.preventDefault();
											
											if( $(e.target).parent().parent().children("#gaiarchquickreplyform").length == 0 ){
												$('.editQuick').remove();
												$('.quoteQuick').remove();
												p = $(e.target).parent().parent();
												t = $(e.target).height();
												$(p).css("position","relative");
												$(p).append('<div id="gaiarchquickreplyform" class="quoteQuick"><img src="http://s.cdn.gaiaonline.com/images/loader.gif" /></div>');
												$("#gaiarchquickreplyform",p).css({
													position: "absolute",
													top: t+"px",
													left: "0px",
													minWidth: "314px",
													padding: '10px',
													background: "#CDD9DD url(http://s.cdn.gaiaonline.com/images/forum/quick_reply_bg.png) no-repeat",
													border: "1px solid #98AEB7",
													zIndex: "192"
												});
												gaiarch.quickreply($(this).attr('href'),true);
											} else {
												if( $(e.target).parent().parent().children("#gaiarchquickreplyform").css("display") == "none" )
													$(e.target).parent().parent().children("#gaiarchquickreplyform").css("display","block")
												else
													$(e.target).parent().parent().children("#gaiarchquickreplyform").css("display","none")
											}
										})
									)
								);
							}
							
							/*if(settings.forumMultiQuote=='true')
							if(true==true)
							{	
								self.removeClass("cta-button-sm").addClass("cta-dropdown-sm-label");
								self.parent().append($('<a href="'+postid+'" class="cta-dropdown-sm-arrow" id="multiquote"></a>').click(function(e){
									e.preventDefault();
									
									//gaiarch.saveQuote($(this).attr('href'));
								}));
							}*/
						});
					
						$('.post-edit').each(function(x){
							var self = $(this);
							var postid = self.attr('href');
							postid = postid.replace(/^.*?\/forum\/compose\/entry\/\d+_(\d+)\/.*$/i,'$1');
							
							if(settings.forumQuickEdit=='true')
							{
								self.parent().before(
									$('<li></li>').prepend(
										$('<a href="'+postid+'" class="cta-button-sm gray-button" id="gaiarchquickedit"><span>Quick Edit</span></a>').click(function(e){
											e.preventDefault();
											if( $(e.target).parent().parent().children("#gaiarchquickreplyform").length == 0 ){
												$('.quoteQuick').remove();
												$('.editQuick').remove();
												p = $(e.target).parent().parent();
												t = $(e.target).height();
												$(p).css("position","relative");
												$(p).append('<div id="gaiarchquickreplyform" class="editQuick"><img src="http://s.cdn.gaiaonline.com/images/loader.gif" /></div>');
												$("#gaiarchquickreplyform",p).css({
													position: "absolute",
													top: t+"px",
													left: "0px",
													minWidth: "314px",
													padding: '10px',
													background: "#CDD9DD url(http://s.cdn.gaiaonline.com/images/forum/quick_reply_bg.png) no-repeat",
													border: "1px solid #98AEB7",
													zIndex: "192"
												});
												gaiarch.quickreply($(this).attr('href'),false);
											} else {
												if( $(e.target).parent().parent().children("#gaiarchquickreplyform").css("display") == "none" )
													$(e.target).parent().parent().children("#gaiarchquickreplyform").css("display","block")
												else
													$(e.target).parent().parent().children("#gaiarchquickreplyform").css("display","none")
											}
										})
									)
								);
							}
						});
					}
				}
			}
			catch(e)
			{
	            console.log(e);
			}
		}
	},
	htmlentities:function(str)
	{
		return str.replace(/&amp;/ig,'&').replace(/&quot;/ig,'"').replace(/&lt;/ig,'<').replace(/&gt;/ig,'>').replace(/&nbsp;/ig,' ').replace(/&#039;/ig,'\'');
	},
	goToByScroll:function(id)
	{
		$('html,body').animate({scrollTop: $("#"+id).offset().top},'slow');
	},
	loadEmoticons:function()
	{
		var emotes;
		
		emotes = settings.emoticons;
		
		if(emotes==null)
		{
			emotes = $.ajax({
				url: chrome.extension.getURL("emotes.json"),
				crossDomain:true,
			    async:false,
			    dataType:'json'
			}).responseText;
		}
		
		emoticons = JSON.parse(emotes);
	},
	addEmoticons:function() {
		var emoticonID = $('#emoticons');
		
		emoticonID.html($('<img />').attr({'src':chrome.extension.getURL("images/loadbar.gif")}));;
		
        emoticonID.css({'height':'60px','overflow-y':'auto'});
        
        B = JSON.parse(settings.emoticons);
        
        emoticonID.html('');
        
        for (i=0;i<B.length;i++) {
            var w = B[i];
            if ("undefined" !== typeof w["class"]) {
            	emoticonID.append(
            		$('<li></li>').html(
            			$('<a></a>').attr({
            				'href':i,
            				'rel':'emoticon-control',
            				'title':w.name+" - "+w.macro_code
            			}).addClass(w['class'])
            		)
            	);
            } else {
            	emoticonID.append(
            		$('<li></li>').html(
            			$('<a></a>').attr({
            				'href':i,
            				'rel':'emoticon-control',
            				'title':w.name+" - "+w.macro_code
            			}).html(
            				$('<img />').attr({
            					'src':w.src,
            					'alt':w.name,
            					'width':'15px',
            					'height':'15px'
            				})
            			)
            		)
            	);
            }
        }
    },
    strreplace:function(subj,txt,replacement)
    {
    	// Equivalent of PHP's str_replace function - http://php.net/str_replace
    	return subj.split(txt).join(replacement);
    	// It could be done using .replace() with a string instead of a regex as first param, but that method only replaces the first match.
    },
    grabForm:function()
    {
    	var message = $('textarea[name="message"]');
    	if(!message.length)
    	{
    		message = $('textarea[name="comment"]');
    	}
    	return message;
    },
    runMacros:function(self){
    	var tehmessagefield = gaiarch.grabForm();
    	
    	if(tehmessagefield.length)
    	{
    		B = JSON.parse(settings.emoticons);
    		
    		post = tehmessagefield.val();
    		
    		for(i=0;i<B.length;i++)
    		{
    			var w = B[i];
    			post = gaiarch.strreplace(post,w.macro_code,'[img]'+w.src+'[/img]');
    		}	
    			
    		tehmessagefield.val(post);
    	}
    },
    inarray:function(needle,haystack)
    {
    	for(var i=0;i<haystack.length;i++)
    	{
    		if(haystack[i]==needle)
    		{
    			return true;
    		}
    	}
    	return false;
    },
    formatEngine:function()
    {
    	// WindPower's formatting engine, version 4.0: Rewritten.... Again!
    	// Remastered for jQuery by Winged Demon X! :D
    	// Note: This time it IS faster and nicer.
    	// Yeah ! Format engine, woot~
    	// And to think, it takes extra time to download these little stupid comments of mine.
    	// By the way, if you ever read them, please tell me you did, it makes me all warm and fuzzy xD
    	// http://www.gaiaonline.com/forum/viewtopic.php?t=19015079
    	var frm=$('#gaiarch_format').val();
    	var cont=gaiarch.grabForm().val();
    	var style=JSON.parse(settings.styles)[frm];
    	var sta=style['beginning'];
    	var fin=style['ending'];
    	var header=style['header'];
    	var footer=style['footer'];
    	var type=style['poststyle'];
    	
    	var basicType = $('[name=basic_type]');
    	
    	if(basicType!=null)
    	{
    		basicType.val(type);
    	}
    	
    	cont=$.trim(cont);
		var lowercont=cont.toLowerCase();
		var lowersta=sta.toLowerCase();
		var decltags=new Array();
		var opentags=new Array('b','i','u','strike','code','color','align','quote','url','size');
		var paramtags=new Array('color','align','size','quote','url');
		var defaultparams={'color':'','align':'','size':'','quote':'','url':''};
		var lastparams={'color':'','align':'','size':'','quote':'','url':''}; // Even though defaultparams and lastparams are identical after initialization, they have to be set separately, otherwise setting lastparams=defaultparams only makes a shallow copy.
		var depth=0;
		var curind=0;
		var depthbreak=new Array();
		var depthtags=new Array('code','quote','img','imgleft','imgright','imgmap');
		for(var i=0;i<opentags.length;i++)
		{
			if(sta.indexOf('['+opentags[i]+']')+1 || sta.indexOf('['+opentags[i]+'=')+1)
			{
				decltags[decltags.length]=opentags[i];
				var ind=sta.indexOf('['+opentags[i]+'=');
				if(ind+1)
				{
					defaultparams[opentags[i]]=sta.substr(ind+opentags[i].length+2,sta.substr(ind+opentags[i].length+2).indexOf(']'));
					defaultparams[opentags[i]]=defaultparams[opentags[i]];
				}
			}
		}
		var len=cont.length;
		if(cont.indexOf('[')!=-1 && cont.indexOf('[')<len-2)	// There's an opening bracket, and it's not the last character of the string
		{
			var texts=new Array(cont.substr(0,cont.indexOf('[')));
			i=texts[0].length+1;
		}
		else
		{
			var texts=new Array(cont);
			i=len;
		}
		// So now we've placed i at the index of the character after the first opening bracket, if any.
		// Bla bla bla [b]bold[/b] bla bla bla
		//             /\ Here, between the [ and the b.
		while(i<len)
		{
			var endind=lowercont.substr(i).indexOf(']');
			if(endind!=-1 && endind<255)	// 255 is a very arbitrary number to prevent processing "false positive" tags. I don't think many tags go over that, though there's no limit with [quote=LongUsernameHere] or [color=LongColorNameHere], etc.~
			{
				var realtag=cont.substr(i,endind);
				var sign=1;
				var params='';
				if(realtag.substr(0,1)=='/')
				{
					sign=-1;
					realtag=realtag.substr(1);
					var tag=realtag.toLowerCase();
				}
				else
				{
					var equal=realtag.indexOf('=');
					if(equal+1) // Tags like [quote], [url], [color], [align], etc
					{
						params=realtag.substr(equal+1)
						var tag=realtag.substr(0,equal).toLowerCase();
					}
					else
					{
						var tag=realtag.toLowerCase();
					}
				}
				if(gaiarch.inarray(tag,depthtags))
				{
					if(depth==1 && sign==-1)
					{
						texts[curind]+='[/'+tag+']';
						curind++;
						texts[curind]='';
					}
					else
					{
						if(!depth && sign==1)
						{
							curind++;
							depthbreak[curind]=tag.substr(0,3)!='img';
							texts[curind]='';
						}
						var text='['+(sign==-1?'/':'')+tag+(params?'='+params:'')+']';
						texts[curind]+=text;
					}
					depth+=sign;
				}
				else if(!depth && gaiarch.inarray(tag,decltags))
				{
					if(params && sign==1 && defaultparams[tag]!=params)
					{
						lastparams[tag]=params;
						texts[curind]+='[/'+tag+']['+tag+'='+params+']';
					}
					else if(sign==-1 && gaiarch.inarray(tag,paramtags) && defaultparams[tag]!=lastparams[tag])
					{
						texts[curind]+='[/'+tag+']['+tag+'='+defaultparams[tag]+']';
						lastparams[tag]=defaultparams[tag];
					}
					// Else, the tag is already declared in the beginning tags, so just ignore the tag.
				}
				else
				{
					texts[curind]+='['+(sign==1?'':'/')+tag+(params?'='+params:'')+']';
				}
				i+=1+(sign==-1)+tag.length+(params?params.length+1:0);
			}
			var staind=cont.substr(i).indexOf('[')+1;
			if(staind)
			{
				texts[curind]+=cont.substr(i,staind-1);
				i+=staind;
			}
			else
			{
				texts[curind]+=cont.substr(i);
				i=len;
			}
		}
		var swtch=true;
		var truecont='';
		for(i=0;i<texts.length;i++)
		{
			if(texts[i] || !depthbreak[i-1])
			{
				if(swtch && texts[i].length > 0)
				{
					if(!i || (i && depthbreak[i-1]))
					{
						truecont+=sta;
					}
					truecont+=texts[i];
					if(i==texts.length-1 || (i<texts.length-1 && depthbreak[i+1]))
					{
						truecont+=fin;
					}
				}
				else
				{
					truecont+=texts[i];
				}
			}
			swtch=!swtch;
		}
    	
    	return $.trim(header+truecont+footer);
    },
    loadStyleSelect:function()
    {
    	var stylesID = $('#gaiarch_format');
    	
    	B = JSON.parse(settings.styles);
    	
    	for (i=0;i<B.length;i++) {
    		var w = B[i];
	    	stylesID.append($('<option></option>').val(i).html(w.name));
    	}
    },
    shortenText:function(msg, chars)
    {
    	if(msg == undefined)
    		return msg;
    	if(chars == undefined)
    		chars = 60;

    	if(msg.length > chars)
    		return msg.substr(0, chars)+"...";
    	else
    		return msg;

    },
    loadQuickDraw:function()
    {
    	// URL = http://www.gaiaonline.com/dailycandy/?mode=ajax&action=issue&list_id=
    	// list_id chart
    	// 1 = Home
    	// 2 = My Gaia
    	// 3 = Forums
    	// 4 = Games
    	// 5 = World
    	// 8 = Shops
    	// 12 = Mobile App

    	var dailyChance = $('#dailyReward');

    	var drawall_css = $.ajax({
			url: chrome.extension.getURL("css/drawall.css"),
		    async:false,
		    dataType:'text'
		}).responseText;

    	drawall_css = drawall_css.replace('{{chrome_url}}', chrome.extension.getURL('')); 

    	$('head').append($('<style></style>').html(drawall_css));

    	dailyChance.before($('<div id="gaiarchDrawAll" class="gaiarchDrawAll"></div>').append($('<a href="#" id="gaiarchDrawAllLink" title="Click here to claim your all you daily rewards"></a>').append($('<span>Click for Daily Reward</span>').css({
			'display': 'none'
		})).css({
			'width': '67px',
			'height': '40px',
			'display': 'block',
			'background': 'transparent url('+chrome.extension.getURL("images/draw-all.png")+') no-repeat scroll 0 0'
		})).append('<div id="gaiarchDrawAllBox"><div id="gaiarchDrawAllBoxTitle">Draw All!</div><div id="gaiarchDrawAllBoxContent"><ul class="panel-links" id="yui-gen51"><li id="collect-home" class="panel-link"><span class="panel-img"></span><a id="get-home" rel="1" href="#collect-home" class="collect-link">Collect Home</a><div class="panel-link-descrip"></div></li><li id="collect-mygaia" class="panel-link"><span class="panel-img"></span><a id="get-mygaia" rel="2" href="#collect-mygaia" class="collect-link">Collect My Gaia</a><div class="panel-link-descrip"></div></li><li id="collect-shops" class="panel-link"><span class="panel-img"></span><a id="get-shops" rel="8" href="#collect-shops" class="collect-link">Collect Shops</a><div class="panel-link-descrip"></div></li><li id="collect-forums" class="panel-link"><span class="panel-img"></span><a id="get-forums" rel="3" href="#collect-forums" class="collect-link">Collect Forums</a><div class="panel-link-descrip"></div></li><li id="collect-world" class="panel-link"><span class="panel-img"></span><a id="get-world" rel="5" href="#collect-world" class="collect-link">Collect World</a><div class="panel-link-descrip"></div></li><li id="collect-games" class="panel-link"><span class="panel-img"></span><a id="get-games" rel="4" href="#collect-games" class="collect-link">Collect Games</a><div class="panel-link-descrip"></div></li><li id="collect-mobile" class="panel-link"><span class="panel-img"></span><a id="get-mobile" rel="12" href="#collect-mobile" class="collect-link">Collect Mobile</a><div class="panel-link-descrip"></div></li></ul></div></div>').css({
			'position': 'absolute',
			'top': '110px',
			'left': '780px'
		}));

		$('#gaiarchDrawAllLink').live('click', function(e){
			e.preventDefault();
			if ($("#gaiarchDrawAllBox").is(":hidden")) {
				$("#gaiarchDrawAllBox").slideDown("slow");
			} else {
				$("#gaiarchDrawAllBox").slideUp("slow");
			}
		})

		$('.collect-link').live('click', function(e){
			e.preventDefault();
			var self = $(this);

			$('span', self.parent()).addClass('collect-loading');

			$.ajax({
				url: 'http://www.gaiaonline.com/dailycandy/?mode=ajax&action=issue&list_id='+self.attr('rel'),
				async: true,
				dataType: 'text',
				success: function(data) {
					var self_parent = self.parent();
					data = $.parseXML(data);
					data = $(data);

					if(self.attr('rel') == '12')
					{

						var status_check = data.find('input[name=status]');

						if(status_check.attr('value') == "success")
						{
							var item_name = data.find('input[name=name]').attr('value'),
							item_image = data.find('input[name=image]').attr('value'),
							item_message = data.find('input[name=message]').attr('value');

							// Remove the link and replace it.
							self.remove();

							// Update all the data
							$('.panel-img', self_parent).removeClass('collect-loading');
							$('.panel-img', self_parent).after('<span class="collect-link">'+item_name+'</span>');
							$('.panel-link-descrip', self_parent).append($('<span></span>').text(gaiarch.shortenText(item_message)).css({'title': item_message}));
							$('.panel-img', self_parent).css({
								'background-image': 'url('+item_image+')',
								'background-position': '2px 0px',
								'background-size': '32px'
							});
						}
						else
						{
							// Already Claimed

							// Remove the link and replace it.
							self.remove();

							// Update all the data
							$('.panel-img', self_parent).after('<span class="collect-link">The daily reward was already claimed for today.</span>');
							$('.panel-img', self_parent).removeClass('collect-loading');
						}
					}
					else
					{
						var status_check = data.find('status:first');

						if(status_check.text() == 'success')
						{
							// Get item data out of the XML
							var item_name = data.find('name').text(),
							item_image = data.find('image').text(),
							item_message = data.find('message').text(),
							item_graphic_server = data.find('graphics_server').text();

							// Clean message
							item_message = item_message.replace('&lt;', '<').replace('&gt;', '>').replace('&quot;', '"').replace(/(<([^>]+)>)/ig,"");

							// Make thumbnail full url
							var item_image_url = 'http://'+item_graphic_server+'/images/'+item_image;

							// Remove the link and replace it.
							self.remove();

							// Update all the data
							$('.panel-img', self_parent).removeClass('collect-loading');
							$('.panel-img', self_parent).after('<span class="collect-link">'+item_name+'</span>');
							$('.panel-link-descrip', self_parent).append($('<span></span>').text(gaiarch.shortenText(item_message)).css({'title': item_message}));
							$('.panel-img', self_parent).css({	
								'background-image': 'url('+item_image_url+')',
								'background-position': '2px 0px',
								'background-size': '32px'
							});
						}
						else
						{
							// Already Claimed
							var message = data.find('message:first').text();

							// Remove the link and replace it.
							self.remove();

							// Update all the data
							$('.panel-img', self_parent).after('<span class="collect-link">'+message+'</span>');
							$('.panel-img', self_parent).removeClass('collect-loading');
						}
					}
				}
			});
		})
    },
    checkQuickDraw:function()
    {
    	try
    	{
    		var dailyChance = $('#dailyReward');
    		if(dailyChance != undefined)
    		{
    			gaiarch.loadQuickDraw();	
    		}
    	}
    	catch(e)
    	{}
    },
    doneLoading:function() {
    	$(document).ready(function () {
    		var tehwin = window;
    		gaiarch.checkQuickDraw();
    		if (tehwin.location.href.match(/(https|http)\:\/\/(www.|)gaiaonline.com\/forum\/.*?\/.*?\/t\..*?\/.*?/))
    		{
    			try {
    				gaiarch.buildquickreply(tehwin,'');
    			} catch(e) {console.log(e)};
    		}
    		
    		if (tehwin.location.href.match(/(http|https)\:\/\/(www.|)gaiaonline.com\/profile\/privmsg.php\/.*?/))
    		{
    			//localStorage["messageCount"] = 0;
    		}
    		
    		try {
    			if(settings.forumSmilies=='true'){
    				$('#emoticon_set').append($('<option></option>').html('GaiArch').attr({'value':'gaiarch'}));
    				
    				$('#emoticon_set').change(function(){
    					if($('#emoticon_set option:selected').val() == 'gaiarch')
    					{
    						gaiarch.addEmoticons();
    					}
    				});
    			}
    		}
    		catch (e) {console.log(e);}
    		
    		try {
    			// Formatting
    			if(true == true) {
    				//http://www.gaiaonline.com/forum/compose/entry/new/
    				if (tehwin.location.href.match(/(http|https)\:\/\/(www.|)gaiaonline.com\/forum\/compose\/entry\/new.*?/))
    				{
    					var post_action = $('#post_action');
    					
    					post_action.after('<div id="gaiarch_post_format" class="gaia-info nofooter"><div class="hd"><div class="rc_top_left">&nbsp;</div><div class="rc_top_right">&nbsp;</div><h3>Post Formatting</h3><span class="gaiarch_formattext">Auto-Format:<input type="checkbox" value="1" class="gaiarch_autoFormat" id="gaiarch_postAutoFormat" name="gaiarch_autoFormat" /></span></div><div class="bd"><select id="gaiarch_format"></select></div><div class="ft"><div class="rc_bottom_left">&nbsp;</div><div class="rc_bottom_right">&nbsp;</div></div></div>');
    					
    					$('.gaiarch_formattext').css({ position:'absolute', top:'7px', right:'5px', color:'white', fontWeight:'bold'});
    					
    					$('#gaiarch_post_format .bd').css({ textAlign:'center' });	
    				}
    				
    				if (tehwin.location.href.match(/(http|https)\:\/\/(www.|)gaiaonline\.com\/profile\/privmsg\.php/))
    				{
	    				var pm_html = '<tr><td><div class="opt"><strong>GaiArch:</strong></div><div class="opt_text"><div class="sig"><input type="checkbox" value="1" id="gaiarch_autoFormat" value="1" name="gaiarch_autoFormat" class="gaiarch_autoFormat">&nbsp;Auto-Format</div><div class="sig"><select id="gaiarch_format"></select>&nbsp;Post Format</div></td></tr>';
	    				
	    				$('.opt').parent().parent().before(pm_html);
	    			}    				
    				
    				if(settings.autoFormat=='true')
    				{
    					$('#gaiarch_postAutoFormat').prop('checked', true);
    				}
    				if(settings.pmAutoFormat=='true')
    				{
    					$('#gaiarch_pmAutoFormat').prop('checked', true);
    				}
    				if(settings.commentAutoFormat=='true')
    				{
    					$('#gaiarch_commentAutoFormat').prop('checked', true);
    				}
    				
    				gaiarch.loadStyleSelect();
    				$("#gaiarch_autoFormat").change(function(e){
    					chrome.extension.sendRequest({call:'autoFormat',key:$('.gaiarch_autoFormat').attr('id'),set:$('.gaiarch_autoFormat').is(':checked')});
    				});
    			}
    		}
    		catch (e) {console.log(e);}
    		
    		try {
    			
    			$('form').live('submit', function(e) {
    				//e.preventDefault();
    				var self = this;

    				var clicked = $("[clicked=true]");
    				
    				if ($(self).attr('name') == 'compose' || $(self).attr('name') == 'post' || $(self).find('textarea[id="comment"]')[0])
    				{
    					gaiarch.runMacros();
    					
    					if(clicked.attr('name') == 'action_submit' || clicked.attr('name') == 'submit')
    					{
    						if($('.gaiarch_autoFormat').is(':checked'))
    						{
    							gaiarch.grabForm().val(gaiarch.formatEngine());
    						}
    					}
    				}

    				return true;
    			});
    			
    			$('button').click(function() {
    			    $("button", $(this).parents("form")).removeAttr("clicked");
    			    $(this).attr("clicked", "true");
    			});
    			
    			$('input[type=submit]').click(function() {
    			    $("input[type=submit]", $(this).parents("form")).removeAttr("clicked");
    			    $(this).attr("clicked", "true");
    			});
    		}
    		catch (e) {console.log(e);}
    	});
    }
};

var settings;







