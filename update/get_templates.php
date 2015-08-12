<?php	
function get_template($url, $filename)
{
	include_once('simple_html_dom.php');
	
	//$url= "http://app.incluso.com.mx/drupal/es/login";
  	$response = file_get_html($url);
	
	$templateName = end((explode('/', $url)));
	
	$response = $response->find("div[id=content]");
	//Sacamos todos los URL y los ponemos en $matches
	preg_match_all('#\b(([\w-]+://?|www[.])[^\s()<>]+(?:\([\w\d]+\)|([^[:punct:]\s]|/)))#iS', $response[0], $matches);
	
	$template = dirname(__FILE__) . $filename;
	
	$targets = array('.jpeg', '.jpg', '.png');
	
	$newResponse = $response[0];
	//Recorremos el arreglo bidimensional de URLs
	foreach( $matches[0] as $stringUrl => $value) 
	{	
		//Extraemos la parte final del URL
		$end = end((explode('/', $value)));
		
		foreach($targets as $t)
		{
			//Revisamos si se trata de una imagen
			if (strpos($end,$t) !== false)
			{
				$img = dirname(__DIR__)."/../assets/images/".$templateName."_".$end;
				
				//Guardamos la imagen en local
				copy($value,$img);
				
				//Reemplazamos el URL con la nueva ruta de la imagen
				$newResponse = str_replace($value,$img,$response[0]);
			}
		}
	}
	file_put_contents($template,$newResponse);
	
	//echo htmlspecialchars($response[0]);
	
	//echo htmlspecialchars($newResponse);
}
?>