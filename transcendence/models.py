from PIL import Image

from django import db
from django import core
from django.conf import settings
from django.contrib import auth
from django.dispatch import receiver
from django.utils import timezone


class Profile(db.models.Model):
    user = db.models.OneToOneField(
        auth.models.User, on_delete=db.models.CASCADE
    )
    avatar = db.models.ImageField(
        default="profile_images/default.png", upload_to="profile_images"
    )
    avatar_url = db.models.URLField(max_length=500, blank=True, null=True)
    bio = db.models.TextField(default="No bio available.")
    is_online = db.models.BooleanField(default=False)
    last_active = db.models.DateTimeField(null=True, blank=True)

    def get_friends(self):
        return Profile.objects.filter(
            db.models.Q(receiver__sender=self, receiver__status="accepted")
            | db.models.Q(sender__receiver=self, sender__status="accepted")
        )

    def set_online(self):
        self.is_online = True
        self.last_active = timezone.now()
        self.save()

    def set_offline(self):
        self.is_online = False
        self.save()

    def get_friends_num(self):
        return self.get_friends().count()

    # STATS METHODS
    def wins(self):
        return self.user.won_matches.count()

    def losses(self):
        return self.user.lost_matches.count()

    def matches_played(self):
        return self.wins() + self.losses()

    def win_percentage(self):
        total_matches = self.wins() + self.losses()
        if total_matches == 0:
            return 0
        return (self.wins() / total_matches) * 100

    def total_win_points(self):
        return (
            Match.objects.filter(winner_username=self.user).aggregate(
                db.models.Sum("winner_points")
            )["winner_points__sum"]
            or 0
        )

    def total_loss_points(self):
        return (
            Match.objects.filter(loser_username=self.user).aggregate(
                db.models.Sum("loser_points")
            )["loser_points__sum"]
            or 0
        )

    def loss_percentage(self):
        total_matches = self.wins() + self.losses()
        if total_matches == 0:
            return 0
        return (self.losses() / total_matches) * 100

    def __str__(self):
        return self.user.username

    @property
    def first_name(self):
        return self.user.first_name

    @property
    def last_name(self):
        return self.user.last_name

    @property
    def email(self):
        return self.user.email

    @property
    def avatar_image(self):
        if self.avatar and self.avatar.name != "profile_images/default.png":
            return self.avatar.url
        if self.avatar_url:
            return self.avatar_url
        return "/media/profile_images/default.png"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)


STATUS_CHOICES = (
    ("send", "Send"),
    ("accepted", "Accepted"),
    ("removed", "Removed"),
)


class Relationship(db.models.Model):
    sender = db.models.ForeignKey(
        Profile, on_delete=db.models.CASCADE, related_name="sender"
    )
    receiver = db.models.ForeignKey(
        Profile, on_delete=db.models.CASCADE, related_name="receiver"
    )
    status = db.models.CharField(max_length=8, choices=STATUS_CHOICES)
    updated = db.models.DateTimeField(auto_now=True)
    created = db.models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("sender", "receiver")

    def __str__(self):
        return f"{self.sender}-{self.receiver}-{self.status}"

    def save(self, *args, **kwargs):
        if self.sender == self.receiver:
            raise core.exceptions.ValidationError(
                "You cannot add yourself as a friend."
            )

        # Check if there's an existing reciprocal request two send requests
        reciprocal_request = Relationship.objects.filter(
            sender=self.receiver, receiver=self.sender, status="send"
        ).first()

        if reciprocal_request:
            self.status = "accepted"
            reciprocal_request.status = "accepted"
            reciprocal_request.save()

        super().save(*args, **kwargs)

    def remove_friend(self):
        self.status = "removed"
        self.save()


@receiver(db.models.signals.post_save, sender=auth.models.User)
def create_profile__user(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(db.models.signals.post_save, sender=auth.models.User)
def save_profile__user(sender, instance, update_fields, **kwargs):
    instance.profile.save()


@receiver(db.models.signals.post_save, sender=Relationship)
def post_save_add_to_friends(sender, instance, created, **kwargs):
    if created and instance.status == "accepted":
        pass


@receiver(auth.signals.user_logged_in)
def set_user_online(sender, user, request, **kwargs):
    user.profile.set_online()


@receiver(auth.signals.user_logged_out)
def set_user_offline(sender, user, request, **kwargs):
    user.profile.set_offline()
    user.profile.last_active = timezone.now()
    user.profile.save()


# @receiver(db.models.signals.post_save, sender=Profile )
# def save_profile__profile ( sender, instance, update_fields, **kwargs ):
# 	return
@receiver(db.models.signals.post_save, sender=Profile)
def save_profile__profile(sender, instance, update_fields, **kwargs):
    return


class Match(db.models.Model):
    id = db.models.AutoField(primary_key=True)
    winner_username = db.models.ForeignKey(
        auth.models.User,
        on_delete=db.models.CASCADE,
        related_name="won_matches",
        null=True,
    )
    loser_username = db.models.ForeignKey(
        auth.models.User,
        on_delete=db.models.CASCADE,
        related_name="lost_matches",
        null=True,
    )
    winner_points = db.models.IntegerField(default=0)
    loser_points = db.models.IntegerField(default=0)
    created_at = db.models.DateTimeField(default=timezone.now)
