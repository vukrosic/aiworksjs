<?php
/*
Template Name: Codex Feedback To Database
*/
?>

<?php
$data = json_decode(file_get_contents('php://input'), true);
echo "feedback apiRRRR called";
if(isset($data['prompt'])){
    $prompt = $data['prompt'];
    $response = $data['response'];
    // add to database
    global $wpdb;
    $table = "codex_feedback";
    $tableData = array(
        'prompt' => $data['prompt'],
        'response' => $data['response']
    );
    $format = array(
        '%s',
        '%s'
    );
    $wpdb->insert( $table, $tableData, $format );
    echo "feedback inserted into db";
}
?>