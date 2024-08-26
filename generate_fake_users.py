from django.contrib.auth.models import User
from faker import Faker

fake = Faker()
User.objects.all().delete()

for email in [fake.unique.email() for i in range(5)]:
	user = User.objects.create_user( fake.user_name(), email, "password" )
	user.last_name = fake.last_name()
	user.is_active = True
	user.save()
