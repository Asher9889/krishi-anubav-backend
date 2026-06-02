## Bucket storage keys:

- bucket name prefix for all:

    - avatars/{userId}/avatar.jpg
    - posts/{userId}/{postId}/image-1.jpg
    - posts/{userId}/{postId}/video-1.mp4
    - chat/{chatId}/attachment.pdf

### For User Avatar:
```javascript
avatars/
└── userId/
    └── avatar.jpg
```


### For Posts
```javascript
posts/
└── userId/
    └── postId/
        ├── image-1.jpg
        ├── image-2.jpg
        └── video.mp4
```
---