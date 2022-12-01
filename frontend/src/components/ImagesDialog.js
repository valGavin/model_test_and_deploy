import { Dialog, DialogTitle, IconButton, ImageList, ImageListItem, ImageListItemBar } from "@mui/material";
import { AddPhotoAlternateRounded } from "@mui/icons-material";
import Test1 from "../assets/test.jpg";
import Test2 from "../assets/test2.jpg";
import Test3 from "../assets/test3.jpg";
import Test4 from "../assets/test4.jpg";
import Test5 from "../assets/test5.jpg";

function ImagesDialog(props) {
  const { onClose, selectedImage, open } = props;

  const handleClose = () => {
    onClose(selectedImage);
  }

  const handleListItemClick = (value) => {
    onClose(value);
  }

  const sampleImages = [
    { img: Test1, title: "Intersection" }, { img: Test2, title: "Traffic Sign"},
    { img: Test3, title: "Crowd"}, { img: Test4, title: "Pose Estimation"},
    { img: Test5, title: "Facial Landmark"}
  ];

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Select Test Image</DialogTitle>
      <ImageList>
        {sampleImages.map(sample => (
          <ImageListItem
            sx={{ textAlign: "center" }} key={sample.title}
            onClick={() => {
              fetch(sample.img).then(img => {
                img.blob().then(img_blob => {
                  const img_file = new File([img_blob], sample.img, { type: img_blob.type });
                  handleListItemClick(img_file);
                });
              });
            }}>
            <img src={sample.img} alt={sample.title} loading="lazy" />
            <ImageListItemBar title={sample.title} />
          </ImageListItem>
        ))}
        <ImageListItem key="Add Image">
          <IconButton
            aria-label="Add Image" sx={{ borderRadius: 10, height: "100%" }}
            size="large" component="label"
            onChange={event => {
              handleListItemClick(event.target.files[0]);
            }}>
            <input type="file" accept={"image/png, image/jpeg"} hidden />
            <AddPhotoAlternateRounded color="action" sx={{ width:"20vw", height: "20vh", opacity: "30%" }} />
            <ImageListItemBar title="Upload an image" />
          </IconButton>
        </ImageListItem>
      </ImageList>
    </Dialog>
  );
}

export default ImagesDialog;