try {
	var styles = JSON.parse(localStorage['styles']);
}
catch (e) {
	var styles = null;
}

function load() {
	// For notifications
	if(localStorage["messagesNotifications"]=='true')
	{
		$('#messagesNotifications').prop('checked', true);
	}
	if(localStorage["requestsNotifications"]=='true')
	{
		$('#requestsNotifications').prop('checked', true);
	}
	if(localStorage["announcementsNotifications"]=='true')
	{
		$('#announcementsNotifications').prop('checked', true);
	}
	if(localStorage["noticesNotifications"]=='true')
	{
		$('#noticesNotifications').prop('checked', true);
	}
	
	// For Forum features
	if(localStorage["forumQuickEdit"]=='true')
	{
		$('#forumQuickEdit').prop('checked', true);
	}
	if(localStorage["forumQuickQuote"]=='true')
	{
		$('#forumQuickQuote').prop('checked', true);
	}
}

function loadStyle()
{
	var w;
	var poststyles = $('#styles');
	var postingTitle = $('#postingTitle');
	var postFormat = $('#postStyle');
	var beginning = $('#beginning');
	var ending = $('#ending');
	var header = $('#header');
	var footer = $('#footer');
	var offset = $('#postFormatOffset');
	var postFormatDefault = $('#postFormatDefault');
	
	if(styles==null)
	{
		styles = $.ajax({
			url: chrome.extension.getURL("style.json"),
			crossDomain:true,
		    async:false,
		    dataType:'json'
		}).responseText;
		
		styles = JSON.parse(styles);
	}
	
	
	poststyles.html('');
	for(i=0;i<styles.length;i++)
	{
		w = styles[i];
		if(w['default']!='false')
		{
			poststyles.append('<option value="'+i+'" class="defaultStyle"> -- '+w['name']+'</option>');
			postingTitle.val(w.name);
			beginning.val(w.beginning);
			ending.val(w.ending);
			header.val(w.header);
			footer.val(w.footer);
			offset.val(i);
			postFormat.val(w.poststyle);
			postFormatDefault.val(w['default']);
							
		}
		else {
			poststyles.append('<option value="'+i+'">'+w['name']+'</option>');
		}
	}
	previewFormat();
	
	$('textarea').keyup(function() {
			previewFormat();
	});
}
	
function loadEmoticons()
{
	var emoticonID = $('#emoticons');
	var emotes = localStorage["emoticons"];
	
	$('#smileyOffset').val('');
	$('#smileyCode').val('');
	$('#smileyName').val('');
	$('#smileyURL').val('');
	$('#preview-image').html('');
	
	emoticonID.html('');
	
	try {
		if(localStorage["emoticons"]==null)
		{
			emotes = $.ajax({
				url: chrome.extension.getURL("emotes.json"),
				crossDomain:true,
			    async:false,
			    dataType:'json'
			}).responseText;
		}
		
		B = JSON.parse(emotes);
		
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
		    					'rel':w.macro_code,
		    					'width':'15px',
		    					'height':'15px'
		    				})
		    			)
		    		)
		    	);
		    }
		}
	}
	catch(e)
	{
		$('#smilies').prepend($('<div class="alert-message smiliesError danger"><a class="close" href="#">×</a><p>Something has gone wrong while loading smilies, please refesh this page.</p></div>').fadeIn(1000).fadeOut(2000));
	}
}

function bbcode_parser(str) {
	search = new Array(
	      /\[b\]([\s\S]*?)\[\/b\]/ig, 
	      /\[i\]([\s\S]*?)\[\/i\]/ig,
	      /\[u\]([\s\S]*?)\[\/u\]/ig,
	      /\[strike\](.*?)\[\/strike\]/ig,
	      /\[img\](.*?)\[\/img\]/ig,
	      /\[img(left|right)\](.*?)\[\/img(left|right)\]/ig,
	      /\[imgmap\](.*?)\[\/imgmap\]/ig,
	      /\[url\="?(.*?)"?\](.*?)\[\/url\]/ig,
	      /\[url\](.*?)\[\/url\]/ig,
	      /\[code\]([\s\S]*?)\[\/code\]/ig,
	      /\[quote\]([\s\S]*?)\[\/quote\]/ig,
	      /\[quote\="?(.*?)"?\]([\s\S]*?)\[\/quote\]/ig,
	      /\[color\=(.*?)\]([\s\S]*?)\[\/color\]/ig,
	      /\[size\="?(.*?)"?\]([\s\S]*?)\[\/size\]/gi,
	      /\[align\="?(right|left|center)"?\]([\s\S]*?)\[\/align\]/ig,
	      /\[align\=(.*?)\]([\s\S]*?)\[\/align\]/ig,
	      /\[list\="?(.*?)"?\]([\s\S]*?)\[\/list\]/gi,
	      /\[list\]/gi,
	      /\[\/list\]/gi,
	      /\[\*\]\s?(.*?)\n/ig,
	      /\n\n/ig,
	      /\[center\]([\s\S]*?)\[\/center\]/ig,
	      /\[left\]([\s\S]*?)\[\/left\]/ig,
	      /\[right\]([\s\S]*?)\[\/right\]/ig);
	
	replace = new Array(
	      "<strong>$1</strong>",
	      "<em>$1</em>",
	      "<span style=\"text-decoration: underline\">$1</span>",
	      "<span style=\"text-decoration: line-through\">$1</span>",
	      "<img src=\"$1\" alt=\"User Image\" />",
	      "<img src=\"$2\" style=\"float:$1;\" alt=\"User Image\" />",
	      "<img src=\"$1\" ismap=\"ismap\" alt=\"User Image\" />",
	      "<a href=\"$1\">$2</a>",
	      "<a href=\"$1\">$1</a>",
	      "<div class=\"code\">test</div>",
	      "<div class=\"quote\"><div class=\"cite\">Quote:</div><div class=\"quoted\">$1<div class=\"clear\"></div></div></div>",
	      "<div class=\"quote\"><div class=\"cite\">$1</div><div class=\"quoted\">$2<div class=\"clear\"></div></div></div>",
	      "<span style=\"color:$1\">$2</span>",
	      "<span style=\"font-size: $1px\">$2</span>",
	      "<div class=\"postcontent-align-$1\" style=\"text-align: $1\">$2</div>",
	      "$1",
	      "<ol>$2</ol>",
	      "<ul>",
	      "</ul>",
	      "<li>$1</li>",
	      "<br />",
	      "<div class=\"postcontent-align-center\" style=\"text-align: center\">$1</div>",
	      "<div class=\"postcontent-align-left\" style=\"text-align: left\">$1</div>",
	      "<div class=\"postcontent-align-right\" style=\"text-align: right\">$1</div>");
	
	var test;
	
	for (i = 0; i < search.length; i++) {
	    var stop = false;
	    while(stop==false)
	    {
	    	str = str.replace(search[i], replace[i]);
	    	test = str.match(search[i]);
	    	if(test==null) {
	    		stop = true;
	    	}
	    }
	}
		
	return str;
}

function formatEngine(cont,frm)
{
	// WindPower's formatting engine, version 4.0: Rewritten.... Again!
	// Remastered for jQuery by Winged Demon X! :D
	// Note: This time it IS faster and nicer.
	// Yeah ! Format engine, woot~
	// And to think, it takes extra time to download these little stupid comments of mine.
	// By the way, if you ever read them, please tell me you did, it makes me all warm and fuzzy xD
	// http://www.gaiaonline.com/forum/viewtopic.php?t=19015079
	var beginning = $('#beginning');
	var ending = $('#ending');
	var head = $('#header');
	var foot = $('#footer');
	
	var style = {'beginning':beginning.val(),'ending':ending.val(),'header':head.val(),'footer':foot.val()};
	
	var sta=style['beginning'];
	var fin=style['ending'];
	var header=style['header'];
	var footer=style['footer'];
	
	cont = $.trim(cont);
	if(sta==null)
	{
		sta = '';	
	}
	if(fin==null)
	{
		fin = '';
	}
	var lowercont = cont.toLowerCase();
	var lowersta = sta.toLowerCase();
	var decltags=new Array();
	var opentags=new Array('b','i','u','strike','code','color','align','quote','url','size');
	var paramtags=new Array('color','align','size','quote','url');
	var defaultparams={'color':'','align':'','size':'','quote':'','url':''};
	var lastparams={'color':'','align':'','size':'','quote':'','url':''};
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
			if($.inArray(tag,depthtags))
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
			else if(!depth && $.inArray(tag,decltags))
			{
				if(params && sign==1 && defaultparams[tag]!=params)
				{
					lastparams[tag]=params;
					texts[curind]+='[/'+tag+']['+tag+'='+params+']';
				}
				else if(sign==-1 && $.inArray(tag,paramtags) && defaultparams[tag]!=lastparams[tag])
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
			if(swtch)
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
}

function previewFormat() {
	var beginning = $('#beginning');
	var ending = $('#ending');
	var postStyle = $('#postStyle').val();
	var avi_speech = $('#avi-speech');
	var style = $('#styles').val();
	var styleTypes = ['say','whisper','shout','think','document','ornate'];
	
	avi_speech.removeClass('say');
	avi_speech.removeClass('think');
	avi_speech.removeClass('shout');
	avi_speech.removeClass('whisper');
	avi_speech.removeClass('document');
	avi_speech.removeClass('ornate');
	
	
	avi_speech.addClass(styleTypes[postStyle]);
	
	var preview = $('#postcontent');
	
	var bbc = 'Test!<img src="http://gaiarch.gaiatools.com/emotes/ninhr.gif" alt="User Image">';
	
	var code = bbcode_parser(formatEngine(bbc, style));
	
	preview.html(code);
}

function savePostFormat() {
	var w;
	var poststyles = $('#styles');
	var postingTitle = $('#postingTitle');
	var postFormat = $('#postStyle');
	var beginning = $('#beginning');
	var ending = $('#ending');
	var header = $('#header');
	var footer = $('#footer');
	var offset = $('#postFormatOffset').val();
	var postFormatDefault = $('#postFormatDefault');
	var styleExist = false;
	var styleSelector = 0;
	
	if(offset!=null)
	{
		if(styles==null)
		{
			var postData = $.ajax({
				url: "styles.json",
				crossDomain:true,
			    async:false,
			    dataType:'json'
			});
			
			styles = JSON.parse(postData.responseText);
		}
		
		if(styles[offset]!=null)
		{
			styleExist = true;
		}
	}
	
	var w = {};
	
	w['name'] = postingTitle.val();
	w['poststyle'] = postFormat.val();
	w['beginning'] = beginning.val();
	w['header'] = header.val();
	w['footer'] = footer.val();
	w['ending'] = ending.val();
	w['default'] = postFormatDefault.val();
	
	try {
		if(styleExist == true)
		{
			if(w['default'] == '')
			{
				w['default']='false';
			}
			styles[offset] = w;
			styleSelector = offset;
		}
		else
		{
			w['default'] = 'false';
			styles.push(w);
			styleSelector = styles.length;
		}
		$('#formattingRow').prepend($('<div class="alert-message postError success"><a class="close" href="#">×</a><p><strong>Post formatting has been saved</p></div>').fadeIn(1000).fadeOut(2000));
	}
	catch(e) {
		$('#formattingRow').prepend($('<div class="alert-message postError danger"><a class="close" href="#">×</a><p>Could not save formatting. Please try again.</p></div>').fadeIn(1000).fadeOut(2000));
	}
	
	localStorage['styles'] = JSON.stringify(styles);
	
	loadStyle();
	
	poststyles.val(styleSelector);
	
}

function deletePostFormat() {
	var styleExist = false;
	var offset = $('#postFormatOffset').val();
	
	if(offset!=null)
	{
		if(styles==null)
		{
			var postData = $.ajax({
				url: "styles.json",
				crossDomain:true,
			    async:false,
			    dataType:'json'
			});
			
			styles = JSON.parse(postData.responseText);
		}
		
		try {
			if(styles[offset]!=null)
			{
				styles.splice(offset,1);
			}
			$('#formattingRow').prepend($('<div class="alert-message postError success"><a class="close" href="#">×</a><p>Post formatting has been deleted.</p></div>').fadeIn(1000).fadeOut(2000));
		}
		catch(e) {
			$('#formattingRow').prepend($('<div class="alert-message postError danger"><a class="close" href="#">×</a><p>Could not save formatting. Please try again.</p></div>').fadeIn(1000).fadeOut(2000));
		}
	}
	
	localStorage["styles"] = JSON.stringify(styles);
	
	loadStyle();
}

$('#emoticons li a').live('click', function(e){
	e.preventDefault();
	var self = $(this);
	var preview = $('#preview-image');
	var image = $(self).children('img');
	
	var offset = self.attr('href');
	var code = image.attr('rel');
	var name = image.attr('alt');
	var imageurl = image.attr('src');
	
	$('#smileyURL').val(imageurl);
	$('#smileyCode').val(code);
	$('#smileyName').val(name);
	$('#smileyOffset').val(offset);
	
	$('#preview-image').html($('<img />').attr({'src':imageurl,'alt':name+' - '+code})).addClass('center');
});

$('#SaveAddSmiley').live('click', function(e) {
	e.preventDefault();
	var self = $(this);
	var emoticons;
	var emoticonExist = false;
	var preview = $('#preview-image');
	
	var offset = $('#smileyOffset').val();
	var code = $('#smileyCode').val();
	var name = $('#smileyName').val();
	var imageurl = $('#smileyURL').val();
	
	
	if(imageurl!='' && code!='')
	{
		preview.html($('<img />').attr({'src':imageurl,'alt':name+' - '+code})).addClass('center');
		
		if(offset!=null)
		{
			if(localStorage["emoticons"]==null)
			{
				var postData = $.ajax({
					url: "emotes.json",
					crossDomain:true,
				    async:false,
				    dataType:'json'
				});
				
				emoticons = JSON.parse(postData.responseText);
			}
			else
			{
				emoticons = JSON.parse(localStorage["emoticons"]);
			}
			
			if(emoticons[offset]!=null)
			{
				emoticonExist = true;
			}
		}
		
		var w = {};
		
		w.macro_code = code;
		w.src = imageurl;
		w.name = name;
		
		try {
			if(emoticonExist == true)
			{
				emoticons[offset] = w;
			}
			else
			{
				emoticons.push(w);
			}
			
			$('#smilies').prepend($('<div class="alert-message smiliesError success"><a class="close" href="#">×</a><p><strong>Success!</strong> Your smilie has been saved.</p></div>').fadeIn(1000).fadeOut(2000));
		}
		catch(e) {
			$('#smilies').prepend($('<div class="alert-message smiliesError danger"><a class="close" href="#">×</a><p><strong>Count\'t save your smilies please try again.</p></div>').fadeIn(1000).fadeOut(2000));
		}
		
		localStorage["emoticons"] = JSON.stringify(emoticons);
	}
	else {
		$('#smilies').prepend($('<div class="alert-message smiliesError danger"><a class="close" href="#">×</a><p><strong>Fields!</strong> Please fill in required fields.</p></div>').fadeIn(1000).fadeOut(2000));
	}
	loadEmoticons();
	
});

$('#ClearSmileyField').live('click', function(e){
	e.preventDefault();
	$('#smileyOffset').val('');
	$('#smileyCode').val('');
	$('#smileyName').val('');
	$('#smileyURL').val('');
	$('#preview-image').html('');
});

$('#DeleteSmiley').live('click', function(e){
	var emoticonExist = false;
	var offset = $('#smileyOffset').val();
	
	if(offset!=null)
	{
		if(localStorage["emoticons"]==null)
		{
			var emoticons = $.ajax({
				url: "emotes.json",
				crossDomain:true,
			    async:false,
			    dataType:'json'
			});
			
			emoticons = JSON.parse(postData.responseText);
		}
		else
		{
			emoticons = JSON.parse(localStorage["emoticons"]);
		}
		
		if(emoticons[offset]!=null)
		{
			emoticons.splice(offset,1);
		}
		else
		{
			$('#smilies').prepend($('<div class="alert-message smiliesError danger"><a class="close" href="#">×</a><p><strong>That is not an emote.</p></div>').fadeIn(1000).fadeOut(2000));
		}
	}
	
	localStorage["emoticons"] = JSON.stringify(emoticons);
	
	loadStyles();
});

$('#ResetSmilies').live('click', function(e){
	e.preventDefault();
	try {
		var cfm = confirm('You are about to reset all emoticons to the default emoticons');
		if(cfm){
			var emotes = $.ajax({
				url: "emotes.json",
				crossDomain:true,
			    async:false,
			    dataType:'json'
			}).responseText;
			
			localStorage["emoticons"] = emotes;
		}
	}
	catch(e)
	{
		$('#smilies').prepend($('<div class="alert-message smiliesError danger"><a class="close" href="#">×</a><p><strong>Count\'t reset your smilies please try again.</p></div>').fadeIn(1000).fadeOut(2000));
	}
	
	loadEmoticons();
	
});



$('#postClearBtn').live('click', function(e){
	e.preventDefault();
	$('#postingTitle').val('');
	$('#beginning').val('');
	$('#postStyle').val('');
	$('#ending').val('');
	$('#header').val('');
	$('#footer').val('');
	$('#postFormatOffset').val('');
	$('#postFormatDefault').val('');
	$('#postingTitle').val('New Post Style');
	previewFormat();
});

$('#save').live('click', function(e) {
	e.preventDefault();
	localStorage["messagesNotifications"] = $("#messagesNotifications").is(':checked');
	localStorage["requestsNotifications"] = $("#requestsNotifications").is(':checked');
	localStorage["announcementsNotifications"] = $("#announcementsNotifications").is(':checked');
	localStorage["noticesNotifications"] = $("#noticesNotifications").is(':checked');
	
	localStorage["forumQuickEdit"] = $("#forumQuickEdit").is(':checked');
	localStorage["forumQuickQuote"] = $("#forumQuickQuote").is(':checked');
	$('#notifications').prepend($('<div class="alert-message smiliesError success"><a class="close" href="#">×</a><p><strong>Your settings have been saved.</p></div>').fadeIn(1000).fadeOut(2000));
});

$('#savePostFormat').live('click', function(e){ savePostFormat(); });

$('select#styles').live('change', function(e) {
	var selected = $(this).val();
	var postingTitle = $('#postingTitle');
	var postFormat = $('#postStyle');
	var beginning = $('#beginning');
	var ending = $('#ending');
	var header = $('#header');
	var footer = $('#footer');
	var offset = $('#postFormatOffset');
	var postFormatDefault = $('#postFormatDefault');
	
	var w = '';
	w = styles[selected];
	
	postingTitle.val(w.name);
	beginning.val(w.beginning);
	ending.val(w.ending);
	header.val(w.header);
	footer.val(w.footer);
	offset.val(selected);
	postFormat.val(w.poststyle);
	
	postFormatDefault.val(w['default']);
	
	previewFormat();
});

$('#chmeImport').live('change', function(e) { 
	var fileurl = document.getElementById('chmeImport').files[0];
	var data = '';
	var fileExtension = fileurl.name.split(/\./g);
	
	
	if(fileExtension[fileExtension.length-1] != 'gaiarch') {
		alert('Please choose .gaiarch setting files only.');
		return false;
	}
	
  	var reader = new FileReader();

	reader.onload = (function(theFile) {
		return function(e) {
			if (e.target.readyState == FileReader.DONE) {
				var fileData = e.target.result;
				
				try {
					data = JSON.parse(fileData);
				}
				catch(e) {
					data = $.parseXML(fileData);
				}
				
				var quickquote, quickedit, emotes, formats, newFormats = [], newEmotes = [];
				
				quickquote = $(data).find('preference[name="quickquote"]');
				quickedit = $(data).find('preference[name="quickedit"]');
				emotes = $(data).find('emote');
				formats = $(data).find('format');
				
				// Quick Quote
				if(quickquote != null)
				{
					localStorage["forumQuickQuote"] = quickquote.text();
				}
				
				// Quick Edit
				if(quickedit != null)
				{
					localStorage["forumQuickEdit"] = quickedit.text();
				}
				
				// Emotes
				if(emotes != null)
				{
					$.each(emotes, function(key, value){
						var w = {};
						
						w.macro_code = $(value).attr('code');
						w.src = $(value).attr('url');
						w.name = $(value).text();
						newEmotes.push(w);
					});
					localStorage["emoticons"] = JSON.stringify(newEmotes);
				}
				
				// Formats
				if(formats != null)
				{
					$.each(formats, function(key, value){
						var w = {};
						
						w['name'] = $(value).attr('name');
						w['poststyle'] = $(value).attr('poststyle');
						w['beginning'] = $(value).find('begin').text();
						w['header'] = $(value).find('header').text();
						w['footer'] = $(value).find('footer').text();
						w['ending'] = $(value).find('end').text();
						
						if(w['name'] == 'Default')
						{
							w['default']='true';
						}
						else {
							w['default'] = 'false';
						}
						
						newFormats.push(w);
					});
					
					localStorage['styles'] = JSON.stringify(newFormats);
				}
			}
	    };
	})(fileurl);
	
  	reader.readAsBinaryString(fileurl);
});

$('#deletePostFormat').live('click', function(e) { deletePostFormat(); });

$(document).ready(function() {
	$('.topbar').scrollSpy();
	$(".alert-message").alert('close');
});