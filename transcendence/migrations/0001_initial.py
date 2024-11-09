# Generated by Django 5.1 on 2024-10-24 07:58

import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Match',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('winner_points', models.IntegerField(default=0)),
                ('loser_points', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('loser_username', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='lost_matches', to=settings.AUTH_USER_MODEL)),
                ('winner_username', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='won_matches', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('avatar', models.ImageField(default='profile_images/default.jpg', upload_to='profile_images')),
                ('avatar_url', models.URLField(blank=True, max_length=500, null=True)),
                ('bio', models.TextField(null=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]