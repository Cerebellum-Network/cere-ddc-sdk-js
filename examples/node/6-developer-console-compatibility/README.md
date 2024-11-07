# Developer console compatibility

By default, files uploaded to DDC aren't indexed. 

Once you uploaded file to DDC you receive it's CID a unique hash-based identifier so later you can access your file using bucket id and CID.

In order to have a folder structure (hierarchy) Developer Console uses DAG API. That API allows us to structure set of files if a folder hierarchy where each folder is a separate DAG node. So when client uploads a file or creates a folder the all DAG node above it are updated as well.
