"""News DRF-Viewset test file"""

from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from backend.osmosewebsite.serializers.news import NewsFields


class NewsViewSetTestCase(APITestCase):
    """Test NewsViewSetTestCase when list or detail news are request"""

    fixtures = ["users", "news"]
    creation_data = {
        "title": "string",
        "intro": "string",
        "body": "string",
        "date": "2022-01-25T10:42:15Z",
        "thumbnail": "string",
    }

    def setUp(self):
        self.client.login(username="user1", password="osmose29")

    def tearDown(self):
        self.client.logout()

    def test_list(self):
        """NewsViewSet 'list' returns list of news"""
        url = reverse("news-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(list(response.data[0].keys()), NewsFields)
        self.assertEqual(
            response.data[1]["title"], "Themselves determine story far film one."
        )
        self.assertEqual(
            response.data[1]["body"],
            "<h2>Pretty summer term something page officer field century process allow.</h2><p>Remain firm heart within"
            " national purpose candidate represent. Against activity early college people. Situation north free travel "
            "happy.</p><p>Somebody quickly sister style. Relationship dark role.</p><img "
            "src='https://api.dicebear.com/7.x/identicon/svg?seed=film' width='100px'><p>Test amount return court. "
            "Despite also big available black treat level. Article begin style career become same. Operation wait "
            "husband theory fund.</p><h2>Industry speak radio experience rather several under perform source share."
            "</h2><p>Trip should reality institution benefit science air sound.</p><p>Gas enter mean maybe newspaper. "
            "Now need team half make. Relationship modern need church everyone parent author.</p><img "
            "src='https://api.dicebear.com/7.x/identicon/svg?seed=often' width='100px'><p>Its close billion boy. Letter"
            " political performance face boy. West seven fish.</p><img "
            "src='https://api.dicebear.com/7.x/identicon/svg?seed=during' width='200px'><p>Deep either also accept "
            "might. Car cell identify win treatment.</p><h2>Thank size let from enter discussion where option."
            "</h2><p>Little commercial great official. Policy these imagine few this expert on southern.</p><img "
            "src='https://api.dicebear.com/7.x/identicon/svg?seed=he' width='200px'><p>Upon standard age sign. Million"
            " item ok.</p><p>Own window Mr exactly. Unit bag no. Write various before. So around wide task keep more."
            "</p><p>Painting chance rich structure. Science see you high direction.</p><p>Hear value various reduce boy"
            " top marriage affect. Prevent attorney reality president key life.</p><h2>Reveal white despite walk wind "
            "me feel.</h2><p>Thus should list suggest. Hand about goal hear public. Add score spring interesting light"
            " say Republican.</p><img src='https://api.dicebear.com/7.x/identicon/svg?seed=blue' width='150px'><img "
            "src='https://api.dicebear.com/7.x/identicon/svg?seed=amount' width='100px'><p>Feeling tell business show "
            "eight. Science available occur street shake in eat. During Republican question follow candidate big stay."
            "</p><h2>Success reduce these fish institution natural cost citizen support during.</h2><img "
            "src='https://api.dicebear.com/7.x/identicon/svg?seed=size' width='100px'><p>Fact soldier these billion. "
            "Mother within manage work mission financial.</p><img "
            "src='https://api.dicebear.com/7.x/identicon/svg?seed=student' width='100px'>",
        )

    def test_retrieve(self):
        """NewsViewSet 'retrieve' returns news details"""
        url = reverse("news-detail", kwargs={"pk": 1})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(list(response.data), NewsFields)

        self.assertEqual(
            response.data["title"],
            "Open between political past despite management bill hand live capital service.",
        )
        self.assertEqual(
            response.data["intro"],
            "Her order another who company step office. Garden space various suddenly. Character large standard "
            "attention. Pass time special according role carry base.",
        )
