# jquery-video-area
This plugin will allow you to add a video background to any element. Currently it only supports youtube videos and html videos. I would like to also add support for vimeo in the future.

### Options
| Name | Type | Description | Default |
|------|------|-------------|---------|
| objectId | String | The id given to the object created to contain the video | 'videoAreaContainer' |
| player | String | Player type - Options ( youtube or html5 ) | 'youtube' |
| video | String | Video URL or id for the video to play | 'utn7IUCKck' |
| aspectRatio | String | The ratio of the video you want to watch so we can resize the container properly | '16:9' |
| failMarkup | String | The Markup to put in the video area on failure | ```'<p>Failed to load video background</p>'``` |
| mute | Bool | Make the video muted? | true |
| loop | Bool | Loop the video? | true |

###Usage
Include the file and jquery
```
<script src="/path/to/jquery/jquery.min.js" type="text/javascript"></script>
<script type="text/jscript" src="/path/to/video-area.js"></script>
```

YouTube:
```
$('#videoBg').videoArea({video: 'RijAK7ejSvE'});
```
HTML5:
```
$('#videoBg2').videoArea({
  player:'html5',
  video: 'http://www.w3schools.com/html/mov_bbb.mp4',
  objectId:'html5VideoArea'
  }); 
```
